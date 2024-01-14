import { SlugService } from './../../helpers/slug-generator.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import messages from 'src/constants/message.constant';
import { Project, ProjectStatus, Role, User } from '@prisma/client';
import { CreateProjectInput } from './args/create_project.dto';
import { ProjectResponse } from './res/project-response';
import { map, omit } from 'lodash';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { MailService } from '../mail/mail.service';
import { AssignUserInProject } from './args/assign_user.dto';
import { UpdateProjectInput } from './args/update_project.dto';
import { SolarService } from 'src/helpers/solar.service';
import { ProjectInsightInput } from './args/project_insight_input';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userChecker: UserCheckerService,
    private readonly slugService: SlugService,
    private readonly mailService: MailService,
    private readonly solarService: SolarService,
  ) {}

  async findProject(project_id): Promise<Project> {
    return this.prisma.project.findFirstOrThrow({
      where: {
        id: project_id,
      },
      include: {
        customer: true,
      },
    });
  }

  async getAllProject(user_id: string, query: string): Promise<Project[]> {
    try {
      console.log('the params', {
        user_id,
        query,
      });
      const projects = await this.prisma.project.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
              id: true,
            },
          },
        },
      });
      return projects;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSingleProject(project_id: string): Promise<Project> {
    try {
      const project = this.prisma.project.findFirstOrThrow({
        where: {
          id: project_id,
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              id: true,
              role: true,
              location: true,
              phone: true,
            },
          },
          creator: {
            select: {
              name: true,
              email: true,
              id: true,
              role: true,
            },
          },
          engineer: {
            select: {
              name: true,
              email: true,
              id: true,
              role: true,
            },
          },
          children: true,
          component: true,
          equipment: true,
          electric_load: true,
          quote: true,
        },
      });
      return project;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async storeProject(
    project: Partial<CreateProjectInput>,
    user: User,
  ): Promise<ProjectResponse> {
    try {
      const customer = await this.userChecker.checkUserExistById(
        project.customer_id,
      );

      if (customer) {
        const sun_hours = [
          project.sun_hour_monsoon,
          project.sun_hour_summer,
          project.sun_hour_winter,
        ];
        const project_name = this.slugService.generateSlugWithCustomName(
          customer.name,
        );
        const params: any = {
          ...omit(project, ['customer_id']),
          name: project_name,
          customer: {
            connect: { id: project.customer_id },
          },
          creator: {
            connect: {
              id: user?.id,
            },
          },
          sun_hour_average: sun_hours.some((item) => item === null)
            ? 0
            : sun_hours.reduce((acc, val) => {
                return val !== null ? acc * val : acc;
              }, 1) / sun_hours.length,
          status: ProjectStatus.NEW,
        };
        const info = await this.prisma.project.create({
          data: params,
        });
        await this.mailService.sendProjectInfoToCustomer(customer, info);
        return {
          message: messages.project_create_success,
          project: info,
        };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProject(
    project: Partial<UpdateProjectInput>,
    user: User,
  ): Promise<ProjectResponse> {
    try {
      const customer = await this.userChecker.checkUserExistById(
        project.customer_id,
      );
      const project_data: any = await this.findProject(project.id);
      if (customer && project_data) {
        const solarPowerHours = await this.solarService.getAverageSunlightHours(
          project.latitude,
          project.longitude,
        );

        console.log('solarPowerHours', solarPowerHours);

        const sun_hours = [
          project.sun_hour_monsoon || solarPowerHours.monsoon,
          project.sun_hour_summer || solarPowerHours.summer,
          project.sun_hour_winter || solarPowerHours.winter,
        ];
        let project_name;
        if (customer.name !== project_data?.customer?.name) {
          project_name = this.slugService.generateSlugWithCustomName(
            customer.name,
          );
        }
        const params: any = {
          ...omit(project, ['customer_id']),
          name: project_name,
          customer: {
            connect: { id: project.customer_id },
          },
          creator: {
            connect: {
              id: user?.id,
            },
          },
          sun_hour_monsoon: solarPowerHours.monsoon,
          sun_hour_summer: solarPowerHours.summer,
          sun_hour_winter: solarPowerHours.winter,
          sun_hour_average: sun_hours.some((item) => item === null)
            ? 0
            : sun_hours.reduce((acc, val) => {
                return val !== null ? acc * val : acc;
              }, 1) / sun_hours.length,
          status: ProjectStatus.NEW,
        };
        const info = await this.prisma.project.update({
          where: {
            id: project.id,
          },
          data: params,
        });
        return {
          message: messages.project_updated,
          project: info,
        };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async assignUserInProject(payload: AssignUserInProject): Promise<any> {
    try {
      const { project_id, owner_id } = payload;
      const user = await this.userChecker.checkUserExistById(owner_id);
      const project = await this.findProject(project_id);
      if (user && project) {
        await this.prisma.project.update({
          where: {
            id: project_id,
          },
          data:
            user.role === Role.SALE.toLowerCase()
              ? {
                  creator: {
                    connect: {
                      id: user?.id,
                    },
                  },
                }
              : {
                  engineer: {
                    connect: {
                      id: user?.id,
                    },
                  },
                  status: ProjectStatus.SITE_SURVEY,
                },
        });
        return {
          message: messages.project_assigned_engineer,
        };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProject(project_id: string): Promise<ProjectResponse> {
    try {
      await this.prisma.$transaction([
        this.prisma.project.updateMany({
          where: {
            OR: [
              { id: project_id },
              { parent_id: project_id }, // Assuming parent_id is a field in the Project model
            ],
          },
          data: { deletedAt: new Date() },
        }),
        this.prisma.quote.updateMany({
          where: { project_id: project_id },
          data: { deletedAt: new Date() },
        }),
      ]);
      return {
        message: messages.customer_deleted,
        project: null,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProjectInsight(
    project: Partial<ProjectInsightInput>,
  ): Promise<ProjectResponse> {
    try {
      const isProjectExist = await this.findProject(project?.id);
      if (!isProjectExist) {
        throw new HttpException('project not found', HttpStatus.BAD_REQUEST);
      }
      const params: any = map(project?.components, (item) => ({
        ...item,
        project_id: project.id,
        loose_connection_factor: 0.8,
        efficiency: 100,
        operation_temperature: null,
      }));
      await this.prisma.projectComponent.createMany({
        data: params,
      });
      const sun_hours = [
        project?.sun_hours?.sun_hour_monsoon || isProjectExist.sun_hour_monsoon,
        project?.sun_hours?.sun_hour_summer || isProjectExist.sun_hour_summer,
        project?.sun_hours?.sun_hour_winter || isProjectExist.sun_hour_winter,
      ];
      const updatedProject = await this.prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          status: ProjectStatus.EQUIPMENT_SELECTION,
          sun_hour_monsoon:
            project?.sun_hours?.sun_hour_monsoon ||
            isProjectExist.sun_hour_monsoon,
          sun_hour_summer:
            project?.sun_hours?.sun_hour_summer ||
            isProjectExist.sun_hour_summer,
          sun_hour_winter:
            project?.sun_hours?.sun_hour_winter ||
            isProjectExist.sun_hour_winter,
          sun_hour_average: sun_hours.some((item) => item === null)
            ? 0
            : sun_hours.reduce((acc, val) => {
                return val !== null ? acc + val : acc;
              }, 1) / sun_hours.length,
        },
      });
      return {
        message: messages.project_updated,
        project: updatedProject,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
