import { Global, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Global()
@Injectable()
export class UserCheckerService {
  constructor(private readonly prisma: PrismaService) {}

  async checkUserExist(email: string): Promise<User> {
    const user: any = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }
}
