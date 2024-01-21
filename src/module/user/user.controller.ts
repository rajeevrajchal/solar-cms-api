import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
  Patch,
  Param,
  Get,
  Delete,
} from '@nestjs/common';

import { UserService } from './user.service';
import { HasRoles } from 'src/decorators/role.decorator';
import { Role, User } from '@prisma/client';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { UserInput } from './dto/args/user_input.dto';
import { UserUpdateInput } from './dto/args/user_update_input.dto';
import { UserResponse } from './dto/response/user_response.dto';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.ADMIN)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<Partial<User>[]> {
    return this.userService.getAllUsers();
  }

  @Get(':user_id')
  @HttpCode(HttpStatus.OK)
  async getUserDetail(@Param('user_id') user_id: string): Promise<User> {
    return this.userService.getUserDetail(user_id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  createUser(@Body() user_input: UserInput): Promise<UserResponse> {
    return this.userService.createUser(user_input);
  }

  @HttpCode(HttpStatus.CREATED)
  @Patch(':user_id')
  updateUser(
    @Body() user_input: UserUpdateInput,
    @Param()
    params: {
      user_id: string;
    },
  ): Promise<UserResponse> {
    return this.userService.updateUser(user_input, params.user_id);
  }

  @Delete(':user_id')
  @HttpCode(HttpStatus.OK)
  async deleteProject(
    @Param('user_id') user_id: string,
  ): Promise<UserResponse> {
    return this.userService.deleteUser(user_id);
  }

  @Patch('toggle-status/:user_id')
  @HttpCode(HttpStatus.OK)
  async toggleUserActive(
    @Param('user_id') user_id: string,
  ): Promise<UserResponse> {
    return this.userService.toggleUserActive(user_id);
  }

  @Get('engineer')
  @HasRoles(Role.SALE, Role.ENGINEER)
  @HttpCode(HttpStatus.OK)
  async getAllEngineers(): Promise<Partial<User>[]> {
    return this.userService.getAllEngineers();
  }
}
