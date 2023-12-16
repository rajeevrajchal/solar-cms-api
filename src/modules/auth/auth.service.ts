import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(private mail: MailService) {}

  async login() {
    await this.mail.confirmationLogin();
    console.log('the port is', process.env.MAIL_PORT);

    return `login`;
  }
}
