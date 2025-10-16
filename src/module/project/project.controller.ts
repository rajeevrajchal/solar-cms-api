import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Project, Role, User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { HasRoles } from 'src/decorators/role.decorator';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { CreateProjectInput } from './args/create_project.dto';
import { ProjectDesign } from './args/project_desgin';
import { ProjectEquipmentInput } from './args/project_equipment';
import { UpdateProjectInput } from './args/update_project.dto';
import { ProjectService } from './project.service';
import { ProjectResponse } from './res/project-response';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.SALE, Role.ENGINEER, Role.ADMIN)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async all(
    @CurrentUser() user: Partial<User>,
    @Query() query: QueryParamsDto,
  ): Promise<Project[]> {
    return this.projectService.all(user.id, query);
  }

  @Get(':project_id')
  async show(@Param('project_id') project_id: string): Promise<Project> {
    return this.projectService.show(project_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() project_input: Partial<CreateProjectInput>,
    @CurrentUser() user: any,
  ): Promise<ProjectResponse> {
    return this.projectService.create(project_input, user);
  }

  @Patch(':project_id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Body() project_input: UpdateProjectInput,
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.update(project_input, project_id);
  }

  @Patch(':project_id/project-model')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('design_file'))
  async update_design(
    @Body() design_input: ProjectDesign,
    @Param('project_id') project_id: string,
    @UploadedFile() design_file: Express.Multer.File,
  ): Promise<ProjectResponse> {
    return this.projectService.design_input(
      design_input,
      project_id,
      design_file,
    );
  }

  @Patch(':project_id/equipment')
  @HttpCode(HttpStatus.OK)
  async connect_equipment(
    @Body() equipment_input: ProjectEquipmentInput,
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.connect_equipment(equipment_input, project_id);
  }

  @Delete(':project_id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.delete(project_id);
  }
}
