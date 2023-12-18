import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElectricLoad } from './args/electric_load.dto';
import messages from 'src/constants/message.constant';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findProject(project_id): Promise<Project> {
    return this.prisma.project.findFirstOrThrow({
      where: project_id,
    });
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
}
