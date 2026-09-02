"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let DatabaseService = DatabaseService_1 = class DatabaseService {
    logger = new common_1.Logger(DatabaseService_1.name);
    async handleAutomaticBackup() {
        this.logger.log('🚀 [CRON] Iniciando el proceso de backup automático diario...');
        let filePath = null;
        try {
            filePath = await this.generateBackupFile();
            this.logger.log(`[CRON] Archivo temporal generado con éxito en: ${filePath}`);
            await this.uploadToNextcloud(filePath);
            this.logger.log('[CRON] ☁️ ¡Respaldo subido a la nube de OneRedRD correctamente!');
        }
        catch (error) {
            this.logger.error(`[CRON] ❌ Falló el respaldo automático: ${error.message || error}`);
        }
        finally {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    this.logger.log('[CRON] 🗑️ Archivo temporal de /tmp eliminado para cuidar espacio.');
                }
                catch (cleanupError) {
                    this.logger.error(`[CRON] ⚠️ No se pudo limpiar el archivo temporal: ${cleanupError.message}`);
                }
            }
        }
    }
    async generateBackupFile() {
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `backup-tech2solution-${timestamp}-${Date.now()}.sql`;
        const filePath = path.join('/tmp', fileName);
        const host = process.env.DATABASE_HOST || 'postgres_test';
        const user = process.env.DATABASE_USER || 'postgres';
        const database = process.env.DATABASE_NAME || 'tech_two_solution_db_test';
        const password = process.env.DATABASE_PASSWORD || 'tech2_pass_2024';
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`PGPASSWORD="${password}" pg_dump -h ${host} -U ${user} -d ${database} -F p -f ${filePath}`, (error, stdout, stderr) => {
                if (error) {
                    return reject(new common_1.InternalServerErrorException(`Error ejecutando pg_dump: ${stderr || error.message}`));
                }
                resolve(filePath);
            });
        });
    }
    async uploadToNextcloud(filePath) {
        const fileName = path.basename(filePath);
        const nextcloudUser = process.env.NEXTCLOUD_USER;
        const nextcloudToken = process.env.NEXTCLOUD_APP_PASSWORD;
        const url = `https://nube.oneredrd.com/remote.php/dav/files/${nextcloudUser}/Backup-Techsolution/${fileName}`;
        const fileBuffer = fs.readFileSync(filePath);
        const authHeader = Buffer.from(`${nextcloudUser}:${nextcloudToken}`).toString('base64');
        const response = await fetch(url, {
            method: 'PUT',
            body: fileBuffer,
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/octet-stream',
            },
        });
        if (!response.ok) {
            throw new Error(`Error en la nube de OneRedRD: ${response.statusText}`);
        }
    }
};
exports.DatabaseService = DatabaseService;
__decorate([
    (0, schedule_1.Cron)('30 1 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseService.prototype, "handleAutomaticBackup", null);
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map