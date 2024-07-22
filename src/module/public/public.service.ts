import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ElectricLoad, Project } from '@prisma/client';
import messages from 'src/constants/message.constant';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectService: ProjectService,
  ) {}

  async getSinglePublicProject(project_id: string): Promise<Partial<Project>> {
    try {
      const project = this.prisma.project.findFirstOrThrow({
        where: {
          id: project_id,
        },
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          location: true,
          customer: {
            select: {
              name: true,
              location: true,
            },
          },
          electric_load: true,
        },
      });
      return project;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async storeProjectElectricLoad(
    electric_load: ElectricLoad[],
    project_id: string,
  ): Promise<any> {
    try {
      const project = await this.projectService.find(project_id);
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
}
