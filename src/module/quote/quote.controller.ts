import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { Quote, Role } from '@prisma/client';
import { CreateQuoteInput } from './args/create-quote';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { QuoteResponse } from './res/quote-response';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { Response } from 'express';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.SALE, Role.ENGINEER)
@Controller('quote')
export class QuoteController {
  quote: any;
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProject(): Promise<Quote[]> {
    return this.quoteService.allQuote();
  }

  @Get('/download/:quote_id')
  @HttpCode(HttpStatus.OK)
  async downloadQuote(
    @Param('quote_id') quote_id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.quoteService.downloadQuote(quote_id, res);
  }

  @Get(':quote_id')
  async getSingleProject(@Param('quote_id') quote_id: string): Promise<Quote> {
    return this.quoteService.findQuote(quote_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async storeQuote(
    @Body() input: Partial<CreateQuoteInput>,
    @CurrentUser() user: any,
  ): Promise<QuoteResponse> {
    return this.quoteService.storeQuote(input, user);
  }

  @Patch(':quote_id')
  @HttpCode(HttpStatus.OK)
  async updateQuote(
    @Body() input: Partial<CreateQuoteInput>,
    @CurrentUser() user: any,
    @Param('quote_id') quote_id: string,
  ): Promise<QuoteResponse> {
    return this.quoteService.updateQuote(input, user, quote_id);
  }
}
