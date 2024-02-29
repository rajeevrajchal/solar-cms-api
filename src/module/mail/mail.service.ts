import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Project, User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendInvitation(user: Partial<User>) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Solar Studio',
      template: './invitation_email',
      context: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        link: this.configService.get<string>('FRONTEND_URL'),
      },
    });
  }

  async sendOTP(user: { email: string; code: string; opt_expiry: string }) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'You OTP',
      template: './opt_email',
      context: {
        code: user.code,
        opt_expiry: user.opt_expiry,
      },
    });
  }

  async sendPasswordResetLink(user: { email: string; link: string }) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      template: './reset_password_email',
      context: {
        link: user.link,
      },
    });
  }

  async sendProjectInfoToCustomer(
    user: Partial<User>,
    project: Partial<Project>,
  ) {
    const projectElectricLoadUrl = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/electric_load/${project.id}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Solar Studio',
      template: './project_info_customer',
      context: {
        company_name: this.configService.get<string>('COMPANY_NAME'),
        user: user,
        project: project,
        project_electric_load_url: projectElectricLoadUrl,
      },
    });
  }

  async sendNewQuote(quote: any, attachment: any) {
    await this.mailerService.sendMail({
      to: quote.customer.email,
      subject: 'Project Quote',
      template: './new_quote',
      context: {
        company_name: this.configService.get<string>('COMPANY_NAME'),
        clientName: quote.customer.name || quote.customer.email,
        projectName: quote.project.name,
      },
      attachments: attachment,
    });
  }
}
