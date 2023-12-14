import { Injectable } from '@nestjs/common';
import { UserModel } from 'src/model/user.model';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UserCheckerService {
  constructor(private readonly prisma: PrismaService) {}

  async checkUserExist(email: string): Promise<UserModel> {
    const user: any = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        teams: {
          select: {
            team: true,
          },
        },
      },
    });
    return user;
  }
}
