import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, html: string): Promise<any>;
    sendResetPasswordEmail(to: string, resetUrl: string): Promise<any>;
}
