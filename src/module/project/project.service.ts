import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Project,
  ProjectStatus,
  ProjectType,
  Role,
  User,
} from '@prisma/client';
import { isEmpty, map } from 'lodash';
import messages from 'src/constants/message.constant';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { SolarService } from 'src/helpers/solar.service';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlugService } from './../../helpers/slug-generator.service';
import { CreateProjectInput } from './args/create_project.dto';
import { ProjectDesign } from './args/project_desgin';
import { ProjectEquipmentInput } from './args/project_equipment';
import { UpdateProjectInput } from './args/update_project.dto';
import { ProjectResponse } from './res/project-response';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userChecker: UserCheckerService,
    private readonly slugService: SlugService,
    private readonly mailService: MailService,
    private readonly solarService: SolarService,
    private readonly cloudinary: CloudinaryService,
    private readonly configService: ConfigService,
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
    project_info: true,
    services: true,
  };

  async find(project_id): Promise<Project> {
    return this.prisma.project.findUniqueOrThrow({
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
        model: true,
        electric_load: true,
      },
    });
  }

  async all(user_id: string, query: QueryParamsDto): Promise<Project[]> {
    try {
      const { search, status, customer } = query;
      const where: any = {
        deletedAt: null,
        status: status ? status.toUpperCase() : status,
        customer_id: customer,
        OR: [
          { creator_id: user_id },
          { engineer_id: user_id },
          { sale_user_id: user_id },
        ],
      };

      if (search) {
        where.name = {
          contains: String(search),
          mode: 'insensitive',
        };
      }

      const projects = await this.prisma.project.findMany({
        where,
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

  async show(project_id: string): Promise<Project> {
    try {
      const project = this.find(project_id);
      return project;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(
    project: Partial<CreateProjectInput>,
    user: User,
  ): Promise<ProjectResponse> {
    try {
      const params: any = {
        type: project.type.toUpperCase() as ProjectType,
        name: project.name,
        latitude: project.latitude,
        longitude: project.longitude,
        location: project.location,
        engineer:
          user?.role === Role.ENGINEER ? { connect: { id: user?.id } } : {},
        sale_user:
          user?.role === Role.SALE ? { connect: { id: user?.id } } : {},
        status:
          user?.role === Role.ENGINEER
            ? ProjectStatus.DESIGN_IN_PROGRESS
            : ProjectStatus.NEW,
        creator: {
          connect: {
            id: user?.id,
          },
        },
        project_info: {
          create: {
            area: project.area,
            power_out_watt: project.power_out_watt,
            power_out_voltage: project.power_out_voltage,
            reserve_power_for: project.reserve_power_for || null,
            electrical_capacity: project.electrical_capacity || null,
            orientation: project.orientation,
            shading_factors: project.shading_factors,
            solar_irradiance: project.solar_irradiance,
            tilt_angle: project.tilt_angle,
            panel_type: project.panel_type,
          },
        },
      };
      const info = await this.prisma.project.create({
        data: params,
      });
      return {
        message: messages.project_create_success,
        project: info,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    input: UpdateProjectInput,
    project_id: string,
  ): Promise<ProjectResponse> {
    try {
      const project = await this.find(project_id);
      if (isEmpty(project)) {
        throw new HttpException(
          messages.project_not_found,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const update_project = await this.prisma.project.update({
        where: {
          id: project_id,
        },
        data: input,
      });
      return {
        message: messages.project_updated,
        project: update_project,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async connect_equipment(
    input: ProjectEquipmentInput,
    project_id: string,
  ): Promise<ProjectResponse> {
    try {
      const project = await this.find(project_id);
      if (isEmpty(project)) {
        throw new HttpException(
          messages.project_not_found,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const payload: any = map(input.equipments, (data, index) => {
        return {
          quantity: Number(data.quantity),
          component: data.component_type,
          connection: data.connection,
          set_name: data.set_name || `${data.component_type}-${index}`,
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
      const update_project = await this.prisma.project.update({
        where: {
          id: project_id,
        },
        data: {
          status: ProjectStatus.INSTALLATION_IN_PROGRESS,
        },
      });
      return {
        message: messages.project_updated,
        project: update_project,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async design_input(
    input: ProjectDesign,
    project_id: string,
    design_file: Express.Multer.File,
  ): Promise<ProjectResponse> {
    try {
      const project = await this.find(project_id);
      if (isEmpty(project)) {
        throw new HttpException(
          messages.project_not_found,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const folder_name = `studio/project/${project.id}/`;
      const project_design = await this.cloudinary.uploadFile(
        design_file,
        folder_name,
      );
      await this.prisma.projectModel.create({
        data: {
          model_url: project_design?.url,
          image_id: project_design?.public_id,
          type: project.type,
          project_id: project_id,
        },
      });
      const update_project = await this.prisma.project.update({
        where: {
          id: project_id,
        },
        data: {
          status: ProjectStatus.EQUIPMENT_SELECTION,
        },
      });
      return {
        message: messages.project_updated,
        project: update_project,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(project_id: string): Promise<ProjectResponse> {
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
}
