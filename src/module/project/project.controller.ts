import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ElectricLoad } from './args/electric_load.dto';
import { ProjectResponse } from './res/project-response';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateProjectInput } from './args/create_project.dto';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { Project, Role } from '@prisma/client';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAndRolesGuard)
  @HasRoles(Role.SALE, Role.ENGINEER)
  async getAllProject(@CurrentUser() user: any): Promise<Project[]> {
    return this.projectService.getAllProject(user);
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

  @Patch(':project_id/update-user/:user_id')
  @HttpCode(HttpStatus.OK)
  async assignUserInProject(
    @Param('project_id') project_id: string,
    @Param('user_id') user_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.assignUserInProject(project_id, user_id);
  }
}
