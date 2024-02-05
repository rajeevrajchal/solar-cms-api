import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ElectricLoad, Project } from '@prisma/client';
import { ProjectResponse } from '../project/res/project-response';
import { PublicService } from './public.service';
import { QuoteService } from '../quote/quote.service';
import { Response } from 'express';

@Controller()
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly quoteService: QuoteService,
  ) {}

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

  @Post('quote/download/:quote_id')
  @HttpCode(HttpStatus.OK)
  async downloadQuote(
    @Param('quote_id') quote_id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.quoteService.downloadQuote(quote_id, res);
  }
}
