import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: parseInt(this.configService.get<string>('EMAIL_PORT', '587'), 10),
      secure: this.configService.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: this.configService.get<string>('EMAIL_TLS_REJECT_UNAUTHORIZED') !== 'false',
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html,
      });

      Logger.log(`Correo enviado a ${to}: ${info.messageId}`, EmailService.name);
      return info;
    } catch (error) {
      Logger.error(`Error enviando correo a ${to}`, error as Error, EmailService.name);
      throw error;
    }
  }

  async sendResetPasswordEmail(to: string, resetUrl: string) {
    const subject = 'Restablecer contraseña';
    const html = `<p>Hola,</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>`;

    return this.sendMail(to, subject, html);
  }
}
