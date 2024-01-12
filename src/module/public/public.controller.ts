import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ElectricLoad, Project } from '@prisma/client';
import { ProjectResponse } from '../project/res/project-response';
import { PublicService } from './public.service';

@Controller()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('project/public/:project_id/electric-load')
  @HttpCode(HttpStatus.CREATED)
  async storeCustomerElectricLoad(
    @Body() electric_load: ElectricLoad[],
    @Param('project_id') project_id: string,
  ): Promise<ProjectResponse> {
    return this.publicService.storeProjectElectricLoad(
      electric_load,
      project_id,
    );
  }

  @Get('project/public/:project_id')
  @HttpCode(HttpStatus.OK)
  async getSinglePublicProject(
    @Param('project_id') project_id: string,
  ): Promise<Partial<Project>> {
    return this.publicService.getSinglePublicProject(project_id);
  }
}
