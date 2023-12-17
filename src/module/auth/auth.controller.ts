import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/middleware/guard/local-auth.guard';
import { LocalResetGuard } from 'src/middleware/guard/local-reset.guard';

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
}
