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
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ElectricLoad } from './args/electric_load.dto';
import { ProjectResponse } from './res/project-response';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateProjectInput } from './args/create_project.dto';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { Project, Role, User } from '@prisma/client';
import { AssignUserInProject } from './args/assign_user.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAndRolesGuard)
  @HasRoles(Role.SALE, Role.ENGINEER)
  async getAllProject(
    @CurrentUser() user: Partial<User>,
    @Query('type') type: string,
  ): Promise<Project[]> {
    return this.projectService.getAllProject(user.id, type);
  }

  @Get(':project_id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAndRolesGuard)
  @HasRoles(Role.SALE, Role.ENGINEER)
  async getSingleProject(
    @Param('project_id') project_id: string,
  ): Promise<Project> {
    return this.projectService.getSingleProject(project_id);
  }

  @Get('public/:project_id')
  @HttpCode(HttpStatus.OK)
  async getSinglePublicProject(
    @Param('project_id') project_id: string,
  ): Promise<Partial<Project>> {
    return this.projectService.getSinglePublicProject(project_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAndRolesGuard)
  @HasRoles(Role.SALE)
  async storeProject(
    @Body() project_input: Partial<CreateProjectInput>,
    @CurrentUser() user: any,
  ): Promise<ProjectResponse> {
    return this.projectService.storeProject(project_input, user);
  }

  @Post(':project_id/electric-load')
  @HttpCode(HttpStatus.CREATED)
  async storeCustomerElectricLoad(
    @Body() electric_load: ElectricLoad[],
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.storeProjectElectricLoad(
      electric_load,
      project_id,
    );
  }

  @Patch(':project_id/update-user')
  @HttpCode(HttpStatus.OK)
  async assignUserInProject(
    @Body() payload: AssignUserInProject,
  ): Promise<ProjectResponse> {
    return this.projectService.assignUserInProject(payload);
  }

  @Delete(':project_id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAndRolesGuard)
  @HasRoles(Role.SALE)
  async deleteCustomer(
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.deleteProject(project_id);
  }
}
