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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Project, Role, User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { HasRoles } from 'src/decorators/role.decorator';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { AssignUserInProject } from './args/assign_user.dto';
import { ChangeProjectStatus } from './args/change_project_status';
import { ProjectInsightInput } from './args/project_insight_input';
import { UpdateProjectInput } from './args/update_project.dto';
import { ProjectService } from './project.service.old';
import { ProjectResponse } from './res/project-response';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.SALE, Role.ENGINEER, Role.ADMIN)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProject(
    @CurrentUser() user: Partial<User>,
    @Query() query: QueryParamsDto,
  ): Promise<Project[]> {
    return this.projectService.all(user.id, query);
  }

  @Get('remain-for-quote')
  @HttpCode(HttpStatus.OK)
  async getProjectQuote(): Promise<Project[]> {
    return this.projectService.getProjectForQuote();
  }

  @Get(':project_id')
  async getSingleProject(
    @Param('project_id') project_id: string,
  ): Promise<Project> {
    return this.projectService.getSingleProject(project_id);
  }

  @Patch('copy/:project_id')
  @HttpCode(HttpStatus.OK)
  async copyProject(
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.copyProject(project_id);
  }

  @Patch(':project_id/update-user')
  @HttpCode(HttpStatus.OK)
  async assignUserInProject(
    @Body() payload: AssignUserInProject,
  ): Promise<ProjectResponse> {
    return this.projectService.assignUserInProject(payload);
  }

  @Patch(':project_id/insight')
  @HttpCode(HttpStatus.OK)
  async updateProjectInsight(
    @Body() project_input: Partial<ProjectInsightInput>,
  ): Promise<ProjectResponse> {
    return this.projectService.updateProjectInsight(project_input);
  }

  @Patch(':project_id/equipment')
  @HttpCode(HttpStatus.OK)
  async updateProjectEquipment(
    @Body() input: any,
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.updateProjectEquipment(input, project_id);
  }

  @Patch(':project_id/project-model')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor())
  async updateProjectModel(
    @UploadedFiles() models: Array<Express.Multer.File>,
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.updateProjectModel(models, project_id);
  }

  @Patch(':project_id')
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @Body() project_input: Partial<UpdateProjectInput>,
    @CurrentUser() user: any,
  ): Promise<ProjectResponse> {
    return this.projectService.updateProject(project_input, user);
  }

  @Patch('change-status/:project_id')
  @HttpCode(HttpStatus.OK)
  async changeProjectStatus(
    @Body() project_input: ChangeProjectStatus,
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.changeProjectStatus(project_input, project_id);
  }

  @Post(':project_id/request-load')
  @HttpCode(HttpStatus.OK)
  async requestFillProjectLoad(
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.requestFillProjectLoad(project_id);
  }

  @Delete(':project_id')
  @HttpCode(HttpStatus.OK)
  async deleteProject(
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.deleteProject(project_id);
  }
}
