import { User } from '@prisma/client';

export class UserResponse {
  message: string;
  user?: Omit<User, 'password'> | null;
}
