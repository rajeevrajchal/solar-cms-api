import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Project, ProjectStatus, Role, User } from '@prisma/client';
import { omit } from 'lodash';
import messages from 'src/constants/message.constant';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { SolarService } from 'src/helpers/solar.service';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlugService } from './../../helpers/slug-generator.service';
import { CreateProjectInput } from './args/create_project.dto';
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
      const customer = await this.userChecker.checkUserExistById(
        project.customer_id,
      );

      if (customer) {
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
