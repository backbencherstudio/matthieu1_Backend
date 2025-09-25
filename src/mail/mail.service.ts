import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import appConfig from '../config/app.config';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail4-queue1') private queue: Queue,
    private mailerService: MailerService,
  ) {}

  async sendMemberInvitation({ user, member, url }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = `${user.fname} is inviting you to ${appConfig().app.name}`;

      // add to queue
      await this.queue.add('sendMemberInvitation', {
        to: member.email,
        from: from,
        subject: subject,
        template: 'member-invitation',
        context: {
          user: user,
          member: member,
          url: url,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  // send otp code for email verification
  async sendOtpCodeToEmail({ name, email, otp }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = 'Email Verification';

      // add to queue
      await this.queue.add('sendOtpCodeToEmail', {
        to: email,
        from: from,
        subject: subject,
        template: 'email-verification',
        context: {
          name: name,
          otp: otp,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendVerificationLink(params: {
    email: string;
    name: string;
    token: string;
    // type: string;
  }) {
    try {
      const verificationLink = `${appConfig().app.client_app_url}/verify-email?token=${params.token}&email=${params.email}`; // &type=${params.type}

      // add to queue
      await this.queue.add('sendVerificationLink', {
        to: params.email,
        subject: 'Verify Your Email',
        template: './verification-link',
        context: {
          name: params.name,
          verificationLink,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  // mail.service.ts (same place you have sendOtpCodeToEmail)
  async sendAdminPasswordChangedEmail({
    name,
    email,
    newPassword,
  }: {
    name?: string;
    email: string;
    newPassword: string;
  }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = 'Your password was changed by an admin';

      await this.queue.add('sendAdminPasswordChangedEmail', {
        to: email,
        from: from,
        subject: subject,
        template: 'admin-password-changed', // create this template (see below)
        context: {
          name: name ?? 'User',
          newPassword: newPassword,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Email for Admin role update
  async sendAdminRoleChangedEmail({
    name,
    email,
  }: {
    name: string;
    email: string;
  }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = 'You have been granted Admin access';

      await this.queue.add('sendAdminRoleChangedEmail', {
        to: email,
        from: from,
        subject: subject,
        template: 'admin-role-changed', // Define this template
        context: {
          name: name ?? 'User',
          roleType: 'Admin',
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
