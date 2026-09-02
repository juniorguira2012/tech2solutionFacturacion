"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = (0, nodemailer_1.createTransport)({
            host: this.configService.get('EMAIL_HOST'),
            port: parseInt(this.configService.get('EMAIL_PORT', '587'), 10),
            secure: this.configService.get('EMAIL_SECURE') === 'true',
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
            tls: {
                rejectUnauthorized: this.configService.get('EMAIL_TLS_REJECT_UNAUTHORIZED') !== 'false',
            },
        });
    }
    async sendMail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: this.configService.get('EMAIL_FROM'),
                to,
                subject,
                html,
            });
            common_1.Logger.log(`Correo enviado a ${to}: ${info.messageId}`, EmailService_1.name);
            return info;
        }
        catch (error) {
            common_1.Logger.error(`Error enviando correo a ${to}`, error, EmailService_1.name);
            throw error;
        }
    }
    async sendResetPasswordEmail(to, resetUrl) {
        const subject = 'Restablecer contraseña';
        const html = `<p>Hola,</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>`;
        return this.sendMail(to, subject, html);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map