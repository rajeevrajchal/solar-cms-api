import { PasswordHashService } from 'src/helpers/password-hash.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { omit } from 'lodash';
import messages from 'src/constants/message.constant';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { PasswordGeneratorService } from 'src/helpers/password-generator.service';
import { Role, User } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { UserUpdateInput } from './dto/args/user_update_input.dto';
import { UserInput } from './dto/args/user_input.dto';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { UserResponse } from './dto/response/user_response.dto';

@Injectable()
@UseGuards(JwtAuthGuard)
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userChecker: UserCheckerService,
    private readonly passwordHash: PasswordHashService,
    private readonly passwordGenerator: PasswordGeneratorService,
    private readonly mail: MailService,
  ) {}

  async getAllUsers(): Promise<Partial<User>[]> {
    try {
      const user = await this.prisma.user.findMany({
        where: {
          deletedAt: null,
          NOT: {
            role: Role.CUSTOMER,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          deletedAt: true,
          createdAt: true,
          is_active: true,
          is_temp: true,
        },
      });
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserDetail(user_id: string): Promise<User> {
    try {
      const user: any = await this.prisma.user.findFirstOrThrow({
        where: {
          id: user_id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          deletedAt: true,
          createdAt: true,
          is_active: true,
          is_temp: true,
          creator: true,
          engineer: true,
        },
      });
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllEngineers(): Promise<Partial<User>[]> {
    try {
      const user = await this.prisma.user.findMany({
        where: {
          is_active: true,
          deletedAt: null,
          role: Role.ENGINEER,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          deletedAt: true,
          createdAt: true,
          is_active: true,
          is_temp: true,
        },
      });
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createUser(user_input: UserInput): Promise<UserResponse> {
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

      const user_payload: any = {
        ...user_input,
        name: user_input.name,
        email: user_input.email,
        password: hashPassword,
        role: user_input.role,
        is_temp: true,
      };
      const user = await this.prisma.user.create({
        data: user_payload,
      });
      await this.mail.sendInvitation({
        name: user_input.name,
        email: user_input.email,
        role: user_input.role,
        password: randomPassword,
      });
      return {
        message: messages.user_created,
        user: user,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async updateUser(
    user_input: UserUpdateInput,
    user_id: string,
  ): Promise<UserResponse> {
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

  async deleteUser(user_id: string): Promise<UserResponse> {
    try {
      const user: any = await this.userChecker.checkUserExistById(user_id);
      if (user && user?.project?.length > 0) {
        throw new HttpException(
          messages.user_cannot_delete_has_connected_project,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      await this.prisma.user.update({
        where: { id: user_id },
        data: { deletedAt: new Date(), is_active: false },
      });
      return {
        message: messages.user_updated,
        user: {} as User,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async toggleUserActive(user_id: string): Promise<UserResponse> {
    try {
      const user = await this.userChecker.checkUserExistById(user_id);
      await this.prisma.user.update({
        where: { id: user_id },
        data: { is_active: !user.is_active },
      });
      return {
        message: messages.user_toggle,
        user: omit(user, 'password'),
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
