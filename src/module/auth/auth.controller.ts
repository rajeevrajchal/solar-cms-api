import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/middleware/guard/local-auth.guard';
import { LocalResetGuard } from 'src/middleware/guard/local-reset.guard';
import { JwtAuthRefreshGuard } from 'src/middleware/guard/jwt-auth-refresh.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { LogoutDto } from './dto/response/logout.response.dto';
import { User } from '@prisma/client';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req): Promise<any> {
    return this.authService.login(req);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  @UseGuards(LocalResetGuard)
  reset_password(@Req() req): Promise<any> {
    return this.authService.reset_password(req);
  }

  @UseGuards(JwtAuthRefreshGuard)
  @Post('refresh-token')
  async refreshToken(@Body() body, @CurrentUser() user: User): Promise<any> {
    return this.authService.refreshToken(user, body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: User): Promise<LogoutDto> {
    return this.authService.logout(user.id);
  }
}
