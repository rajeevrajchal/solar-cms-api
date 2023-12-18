import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ElectricLoad } from './args/electric_load.dto';
import { ProjectResponse } from './res/project-response';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(':project_id/electric-load')
  @HttpCode(HttpStatus.CREATED)
  async storeCustomerElectricLoad(
    @Body() electric_load: ElectricLoad[],
    @Param('customer_id') customer_id: string,
  ): Promise<ProjectResponse> {
    return this.projectService.storeProjectElectricLoad(
      electric_load,
      customer_id,
    );
  }
}
