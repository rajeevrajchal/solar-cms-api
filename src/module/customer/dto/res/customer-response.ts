import { User } from '@prisma/client';

export class CustomerResponse {
  message: string;
  customer: Partial<User>;
}
