import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendInvitation(user: Partial<User>) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Eco Spark',
      template: './invitation_email',
      context: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        link: 'localhost:3000',
      },
    });
  }
}
