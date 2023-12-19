import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElectricLoad } from './args/electric_load.dto';
import messages from 'src/constants/message.constant';
import { Project, ProjectStatus, User } from '@prisma/client';
import { CreateProjectInput } from './args/create_project.dto';
import { ProjectResponse } from './res/project-response';
import { omit } from 'lodash';
import { UserCheckerService } from 'src/helpers/user-checker.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userChecker: UserCheckerService,
  ) {}

  async findProject(project_id): Promise<Project> {
    console.log('prrojec_id', project_id);
    return this.prisma.project.findFirstOrThrow({
      where: {
        id: project_id,
      },
    });
  }

  async getAllProject(user: User): Promise<Project[]> {
    try {
      const project = this.prisma.project.findMany({
        where: {
          creator_id: user.id,
        },
      });
      return project;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async storeProject(
    project: CreateProjectInput,
    user: User,
  ): Promise<ProjectResponse> {
    try {
      const customer = await this.userChecker.checkUserExistById(
        project.customer_id,
      );
      if (customer) {
        const params: any = {
          ...omit(project, ['customer_id']),
          customer: {
            connect: { id: project.customer_id },
          },
          creator: {
            connect: {
              id: user?.id,
            },
          },
          status: ProjectStatus.NEW,
        };
        const info = await this.prisma.project.create({
          data: params,
        });
        return {
          message: messages.project_create_success,
          project: info,
        };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async storeProjectElectricLoad(
    electric_load: ElectricLoad[],
    project_id: string,
  ): Promise<any> {
    try {
      const project = await this.findProject(project_id);
      if (project) {
        const param = electric_load.map((load) => ({
          ...load,
          watt_per_hour: load.hour * load.quantity * load.watt,
          project_id: project_id,
        }));
        await this.prisma.electricLoad.createMany({
          data: param,
        });
        return {
          message: messages.electric_load_added,
        };
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async assignUserInProject(project_id: string, user_id: string): Promise<any> {
    try {
      const user = await this.userChecker.checkUserExistById(user_id);
      const project = await this.findProject(project_id);
      if (user && project) {
        await this.prisma.project.update({
          where: {
            id: project_id,
          },
          data: {
            engineer: {
              connect: {
                id: user?.id,
              },
            },
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
}
