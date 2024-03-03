import {
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { OrderStatus, Quote, QuoteStatus, User } from '@prisma/client';
import { exec } from 'child_process';
import { Response } from 'express';
import { last, reduce } from 'lodash';
import messages from 'src/constants/message.constant';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { FileService } from 'src/helpers/file.service';
import { SlugService } from 'src/helpers/slug-generator.service';
import { promisify } from 'util';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveQuote } from './args/approve-quote';
import { CreateQuoteInput } from './args/create-quote';
import { QuoteResponse } from './res/quote-response';
const execAsync = promisify(exec);

@Injectable()
export class QuoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
    private readonly mailService: MailService,
    private readonly fileService: FileService,
  ) {}

  async allQuote(query?: QueryParamsDto): Promise<Quote[]> {
    try {
      const { search, status } = query;
      const where: any = {
        deletedAt: null,
        status: status
          ? status.toUpperCase()
          : {
              not: QuoteStatus.ACCEPTED,
            },
      } as any;

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const quotes = await this.prisma.quote.findMany({
        where,
        include: {
          customer: {
            select: {
              name: true,
              id: true,
            },
          },
          creator: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
      return quotes;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findQuote(quote_id: string): Promise<Quote> {
    try {
      const quote = await this.prisma.quote.findFirstOrThrow({
        where: {
          id: quote_id,
        },
        include: {
          project: {
            include: {
              equipment: {
                select: {
                  quantity: true,
                  inventory: true,
                },
              },
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
              sale_user: {
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
              engineer: {
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
              electric_load: true,
            },
          },
        },
      });
      return quote;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async downloadQuote(
    quote_id: string,
    res: Response,
  ): Promise<StreamableFile> {
    try {
      const quote = await this.findQuote(quote_id);
      const quoteJson = JSON.stringify(quote);

      const script = 'src/public/scripts/create-quote-document.py';
      const { stdout, stderr } = await execAsync(
        `python3 ${script} '${quoteJson}'`,
      );

      if (stderr) {
        throw new HttpException(
          messages.document_failed,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const filePath = stdout.trim();
      const fileName = last(stdout.trim().split('/'));
      return this.fileService.streamAndDeleteFileWithoutData(
        filePath,
        fileName,
        res,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async processQuote(input: Partial<CreateQuoteInput>, user: User) {
    const project = await this.prisma.project.findFirstOrThrow({
      where: {
        id: input.project_id,
      },
      include: {
        equipment: {
          select: {
            quantity: true,
            inventory: {
              select: {
                selling_cost: true,
              },
            },
          },
        },
      },
    });
    if (!project) {
      throw new HttpException('Project Not Found', HttpStatus.NOT_FOUND);
    }

    const vat = 0.13;

    const inventory_cost = reduce(
      project.equipment,
      (
        acc: any,
        current: {
          quantity: number;
          inventory: {
            selling_cost: number;
          };
        },
      ) => {
        const equipment_total =
          +current.quantity * +current.inventory.selling_cost;
        acc = acc + equipment_total;
        return acc;
      },
      0,
    );
    const total = inventory_cost + +input.installation_cost;
    const discount_amount = (total * +input.discount) / 100;
    const total_after_discount = total - discount_amount - +input.adjustment;
    const vat_amount = total_after_discount * vat;
    const net_total = total_after_discount + vat_amount;

    const params: any = {
      name: this.slugService.generateSlugForQuote(project.name),
      inventory_cost: inventory_cost,
      installation_cost: input.installation_cost,
      discount: input.discount,
      adjustment: input.adjustment,
      vat: vat,
      net_total: net_total,
      project_id: input.project_id,
      customer_id: project.customer_id,
      created_by: user.id,
    };
    return params;
  }

  async storeQuote(
    input: Partial<CreateQuoteInput>,
    user: User,
  ): Promise<QuoteResponse> {
    try {
      const params = await this.processQuote(input, user);
      const quote = await this.prisma.quote.create({
        data: {
          ...params,
          status: QuoteStatus.SENT,
        },
      });
      return {
        message: messages.quote_create,
        quote: quote,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateQuote(
    input: Partial<CreateQuoteInput>,
    user: User,
    quote_id: string,
  ): Promise<QuoteResponse> {
    try {
      const params = await this.processQuote(input, user);
      const quote = await this.prisma.quote.update({
        where: {
          id: quote_id,
        },
        data: { ...params, status: QuoteStatus.SENT },
      });
      return {
        message: messages.quote_create,
        quote: quote,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async approveQuote(
    quote_id: string,
    payload?: ApproveQuote,
  ): Promise<QuoteResponse> {
    try {
      console.log('the pyaload', payload);
      const quote = await this.prisma.quote.update({
        where: {
          id: quote_id,
        },
        data: {
          status: QuoteStatus.ACCEPTED,
        },
      });
      console.log('the quote is', quote);
      await this.prisma.order.create({
        data: {
          name: 'SS-Order-1',
          payment: payload.payment,
          status: OrderStatus.ORDERED,
          quote_id: quote_id,
        },
      });
      // await this.mailService.sendQuoteOrdered({});

      return {
        message: messages.quote_approved,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async rejectQuote(quote_id: string): Promise<QuoteResponse> {
    try {
      await this.prisma.quote.update({
        where: {
          id: quote_id,
        },
        data: {
          status: QuoteStatus.REJECTED,
        },
      });
      return {
        message: messages.quote_approved,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async sendQuote(quote_id: string): Promise<QuoteResponse> {
    try {
      const quote: any = await this.findQuote(quote_id);
      const quoteJson = JSON.stringify(quote);

      const script = 'src/public/scripts/create-quote-document.py';
      const { stdout, stderr } = await execAsync(
        `python3 ${script} '${quoteJson}'`,
      );

      if (stderr) {
        throw new HttpException(
          messages.document_failed,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const filePath = stdout.trim();
      const fileName = last(stdout.trim().split('/'));
      await this.mailService.sendNewQuote(
        {
          customer: {
            name: quote.project.customer.name,
            email: quote.project.customer.email,
          },
          project: {
            name: quote.project.name,
          },
        },
        [
          {
            filename: fileName,
            path: filePath,
          },
        ],
      );
      await this.fileService.deleteFile(filePath);
      return {
        message: messages.quote_sent,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async deleteQuote(quote_id: string): Promise<QuoteResponse> {
    try {
      const quote = await this.prisma.quote.findUniqueOrThrow({
        where: {
          id: quote_id,
        },
      });
      if (quote) {
        await this.prisma.quote.update({
          where: {
            id: quote_id,
          },
          data: {
            status: QuoteStatus.EXPIRED,
            deletedAt: new Date(),
          },
        });

        return {
          message: messages.quote_approved,
        };
      }
      throw new HttpException(messages.quote_not_found, HttpStatus.NOT_FOUND);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
