import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async checkMailTransport() {
    await this.mailer.sendMail({
      to: 'rajeevrajchal12@gmail.com',
      subject: 'Mail sent confirmation',
      context: {
        user: 'Rajeev Rajchal',
        confirmationLink: 'rajeev-me.vercel.app',
      },
      template: './confirmation',
    });
  }
}
