import { User } from '@prisma/client';

export class UserResponse {
  message: string;
  user: User;
}
