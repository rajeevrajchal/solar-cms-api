import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthRefreshGuard } from 'src/middleware/guard/jwt-auth-refresh.guard';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { LocalAuthGuard } from 'src/middleware/guard/local-auth.guard';
import { AuthService } from './auth.service';
import { LogoutDto } from './dto/response/logout.response.dto';
import { Request } from 'express';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req: Request): Promise<any> {
    return this.authService.login(req);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  reset_password(
    @Req() req,
    @Body()
    input: {
      password: string;
    },
  ): Promise<any> {
    return this.authService.reset_password(req.user, input.password);
  }

  @UseGuards(JwtAuthRefreshGuard)
  @Post('refresh-token')
  async refreshToken(@Body() body, @CurrentUser() user: User): Promise<any> {
    return this.authService.refreshToken(user, body.refresh_token);
  }

  @Post('forget-password')
  async forget_password(@Body() input: { email: string }): Promise<any> {
    return this.authService.forget_password(input.email);
  }

  @Post('forget-password-otp')
  async forget_password_otp(
    @Body() input: { email: string; otp: string },
  ): Promise<any> {
    return this.authService.forget_password_otp(input);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: User): Promise<LogoutDto> {
    return this.authService.logout(user.id);
  }
}
