import { Quote } from '@prisma/client';

export class QuoteResponse {
  message: string;
  quote?: Partial<Quote> | null;
}
