import { PasswordHashService } from 'src/helpers/password-hash.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { omit } from 'lodash';
import messages from 'src/constants/message.constant';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { PasswordGeneratorService } from 'src/helpers/password-generator.service';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { UserUpdateInput } from './dto/args/user_update_input.dto';
import { UserInput } from './dto/args/user_input.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userChecker: UserCheckerService,
    private readonly passwordHash: PasswordHashService,
    private readonly passwordGenerator: PasswordGeneratorService,
    private readonly mail: MailService,
  ) {}

  async createUser(user_input: UserInput) {
    try {
      const loginUser: User = await this.userChecker.checkUserExist(
        user_input?.email,
      );
      if (loginUser) {
        throw new HttpException(
          `${messages['user_exist']} - as ${loginUser.email}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const randomPassword = this.passwordGenerator.generateRandomPassword(8);
      const hashPassword = await this.passwordHash.hashData(randomPassword);

      const user = await this.prisma.user.create({
        data: {
          name: user_input.name,
          email: user_input.email,
          password: hashPassword,
          role: user_input.role,
          is_temp: true,
        },
      });
      const params: any = {
        ...user_input,
        password: randomPassword,
      };
      await this.mail.sendInvitation(params);
      return {
        message: messages.user_created,
        user: user,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async updateUser(user_input: UserUpdateInput, user_id: string) {
    try {
      const params: any = {
        ...omit(user_input, ['id']),
      };
      const user = await this.prisma.user.update({
        where: { id: user_id },
        data: params,
      });
      return {
        message: messages.user_updated,
        user: user,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
