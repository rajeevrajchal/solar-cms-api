import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
} from '@nestjs/common';

import { UserService } from './user.service';
import { HasRoles } from 'src/decorators/role.decorator';
import { Role } from '@prisma/client';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { UserInput } from './dto/args/user_input.dto';
import { UserUpdateInput } from './dto/args/user_update_input.dto';
import { UserResponse } from './dto/response/user_response.dto';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.ADMIN)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  createUser(@Body() user_input: UserInput): Promise<UserResponse> {
    return this.userService.createUser(user_input);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  updateUser(@Body() user_input: UserUpdateInput): Promise<UserResponse> {
    console.log('the body', user_input);
    return this.userService.updateUser(user_input);
  }
}
