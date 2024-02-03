import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SlugService } from 'src/helpers/slug-generator.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { Quote, QuoteStatus, User } from '@prisma/client';
import messages from 'src/constants/message.constant';
import { QuoteResponse } from './res/quote-response';
import { CreateQuoteInput } from './args/create-quote';
import { reduce } from 'lodash';

@Injectable()
export class QuoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
    private readonly mailService: MailService,
  ) {}

  async allQuote(): Promise<Quote[]> {
    try {
      const quotes = await this.prisma.quote.findMany({
        where: {
          deletedAt: null,
        },
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
              quote: true,
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
        data: params,
      });
      return {
        message: messages.quote_create,
        quote: quote,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
