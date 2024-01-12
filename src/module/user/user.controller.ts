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
  @HasRoles(Role.SALE, Role.ENGINEER)
  @HttpCode(HttpStatus.OK)
  async getAllCustomer(): Promise<User[]> {
    return this.userService.getAllUsers();
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
}
