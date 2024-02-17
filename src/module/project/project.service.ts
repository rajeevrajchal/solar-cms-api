import { SlugService } from './../../helpers/slug-generator.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import messages from 'src/constants/message.constant';
import { Project, ProjectStatus, Role, User } from '@prisma/client';
import { CreateProjectInput } from './args/create_project.dto';
import { ProjectResponse } from './res/project-response';
import { filter, isEmpty, map, omit } from 'lodash';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { MailService } from '../mail/mail.service';
import { AssignUserInProject } from './args/assign_user.dto';
import { UpdateProjectInput } from './args/update_project.dto';
import { SolarService } from 'src/helpers/solar.service';
import { ProjectInsightInput } from './args/project_insight_input';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userChecker: UserCheckerService,
    private readonly slugService: SlugService,
    private readonly mailService: MailService,
    private readonly solarService: SolarService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  projectAttribute = {
    customer: {
      select: {
        name: true,
        email: true,
        id: true,
        role: true,
        location: true,
        phone: true,
        type: true,
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
  };

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
          ...this.projectAttribute,
          quote: {
            select: {
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

  async getProjectForQuote(): Promise<Project[]> {
    try {
      const projects = await this.prisma.project.findMany({
        where: {
          deletedAt: null,
          status: ProjectStatus.CUSTOMER_INQUIRY,
        },
        include: {
          ...this.projectAttribute,
          quote: true,
          equipment: {
            select: {
              quantity: true,
              inventory: true,
            },
          },
        },
      });
      return filter(projects, (item) => item.quote.length <= 0);
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
          ...this.projectAttribute,
          children: true,
          equipment: {
            select: {
              quantity: true,
              inventory: true,
            },
          },
          quote: true,
          model: true,
          electric_load: true,
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
          engineer:
            user?.role === Role.ENGINEER ? { connect: { id: user?.id } } : {},
          sale_user:
            user?.role === Role.SALE ? { connect: { id: user?.id } } : {},
          sun_hour_average: sun_hours.some((item) => item === null)
            ? 0
            : sun_hours.reduce((acc, val) => {
                return val !== null ? acc * val : acc;
              }, 1) / sun_hours.length,
          status:
            user?.role === Role.ENGINEER
              ? ProjectStatus.SITE_SURVEY
              : ProjectStatus.NEW,
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

  // TODO: In future
  async copyProject(project_id: string): Promise<ProjectResponse> {
    try {
      const project: any = await this.findProject(project_id);
      const new_project = await this.prisma.project.create({
        data: {
          ...omit(project, [
            'id',
            'deletedAt',
            'createdAt',
            'updatedAt',
            'start_date',
            'end_data',
          ]),
          status: ProjectStatus.NEW,
        } as any,
      });
      return {
        message: messages.project_copied,
        project: new_project,
      };
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
          data: {
            engineer:
              user?.role === Role.ENGINEER ? { connect: { id: user?.id } } : {},
            sale_user:
              user?.role === Role.SALE ? { connect: { id: user?.id } } : {},
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

  // function to create the model and also the connection
  async updateProjectModel(
    models: Array<Express.Multer.File>,
    project_id: string,
  ): Promise<ProjectResponse> {
    try {
      const isProjectExist = await this.findProject(project_id);
      const folder_name = `studio/projects/${isProjectExist.id}/`;

      if (isEmpty(isProjectExist)) {
        throw new HttpException(
          messages.project_not_found,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (models.length > 0) {
        await map(models, async (model) => {
          const inventory_image = await this.cloudinary.uploadFile(
            model,
            folder_name,
          );
          const payload = {
            model_url: inventory_image?.url,
            image_id: inventory_image?.public_id,
            project_id: project_id,
          } as any;
          await this.prisma.projectModel.create({
            data: payload,
          });
        });
        return {
          message: messages.project_equipment,
          project: {},
        };
      }
      await this.prisma.project.update({
        where: {
          id: project_id,
        },
        data: {
          status: ProjectStatus.CUSTOMER_INQUIRY,
        },
      });
      return {
        message: messages.project_equipment,
        project: isProjectExist || {},
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProjectEquipment(
    input: any,
    project_id: string,
  ): Promise<ProjectResponse> {
    try {
      const isProjectExist = await this.findProject(project_id);
      if (isEmpty(isProjectExist)) {
        throw new HttpException(
          messages.project_not_found,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const payload = map(input.equipments, (data) => {
        return {
          quantity: Number(data.quantity),
          component: data.component_type,
          connection: data.connection,
          set_name: data.set_name,
          voltage: data?.voltage || 0,
          ampere: data?.ampere || 0,
          watt: data?.watt || 0,
          inventory_id: data.inventory,
          project_id: project_id,
        };
      });

      await this.prisma.equipment.createMany({
        data: payload,
      });
      await this.prisma.project.update({
        where: {
          id: project_id,
        },
        data: {
          status: ProjectStatus.DESIGN_IN_PROGRESS,
        },
      });
      return {
        message: messages.project_equipment,
        project: {},
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
