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
import { Quote, Role } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { QueryParamsDto } from '../inventory/args/query-decorators';
import { CreateQuoteInput } from './args/create-quote';
import { QuoteService } from './quote.service';
import { QuoteResponse } from './res/quote-response';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.SALE, Role.ENGINEER)
@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProject(@Query() query: QueryParamsDto): Promise<Quote[]> {
    return this.quoteService.allQuote(query);
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

  @Delete(':quote_id')
  @HttpCode(HttpStatus.OK)
  async deleteQuote(
    @Param('quote_id') quote_id: string,
  ): Promise<QuoteResponse> {
    return this.quoteService.deleteQuote(quote_id);
  }

  @Patch('approve/:quote_id')
  @HttpCode(HttpStatus.OK)
  async approveQuote(
    @Param('quote_id') quote_id: string,
  ): Promise<QuoteResponse> {
    return this.quoteService.approveQuote(quote_id);
  }

  @Patch('reject/:quote_id')
  @HttpCode(HttpStatus.OK)
  async rejectQuote(
    @Param('quote_id') quote_id: string,
  ): Promise<QuoteResponse> {
    return this.quoteService.rejectQuote(quote_id);
  }
}
