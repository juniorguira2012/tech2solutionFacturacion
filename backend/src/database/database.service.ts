// src/database/database.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule'; // 🌟 Motor de tareas programadas
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService {
  // Inicializamos el logger para ver los reportes en los logs de Portainer
  private readonly logger = new Logger(DatabaseService.name);

  // ⏱️ TAREA PROGRAMADA 
  @Cron('30 1 * * *')
  async handleAutomaticBackup() {
    this.logger.log('🚀 [CRON] Iniciando el proceso de backup automático diario...');
    let filePath: string | null = null;

    try {
      // 1. Generar el archivo .sql en la carpeta /tmp
      filePath = await this.generateBackupFile();
      this.logger.log(`[CRON] Archivo temporal generado con éxito en: ${filePath}`);

      // 2. Subir el archivo generado a Nextcloud
      await this.uploadToNextcloud(filePath);
      this.logger.log('[CRON] ☁️ ¡Respaldo subido a la nube de OneRedRD correctamente!');

    } catch (error) {
      this.logger.error(`[CRON] ❌ Falló el respaldo automático: ${error.message || error}`);
    } finally {
      // 3. LIMPIEZA: Eliminamos el archivo de /tmp para no saturar el almacenamiento del contenedor
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          this.logger.log('[CRON] 🗑️ Archivo temporal de /tmp eliminado para cuidar espacio.');
        } catch (cleanupError) {
          this.logger.error(`[CRON] ⚠️ No se pudo limpiar el archivo temporal: ${cleanupError.message}`);
        }
      }
    }
  }

  // --- TUS FUNCIONES EN JUEGO ---

  async generateBackupFile(): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `backup-tech2solution-${timestamp}-${Date.now()}.sql`;
    const filePath = path.join('/tmp', fileName);

    const host = process.env.DATABASE_HOST || 'postgres_test';
    const user = process.env.DATABASE_USER || 'postgres';
    const database = process.env.DATABASE_NAME || 'tech_two_solution_db_test';
    const password = process.env.DATABASE_PASSWORD || 'tech2_pass_2024';

    return new Promise((resolve, reject) => {
      exec(
        `PGPASSWORD="${password}" pg_dump -h ${host} -U ${user} -d ${database} -F p -f ${filePath}`,
        (error, stdout, stderr) => {
          if (error) {
            return reject(new InternalServerErrorException(`Error ejecutando pg_dump: ${stderr || error.message}`));
          }
          resolve(filePath);
        }
      );
    });
  }

  async uploadToNextcloud(filePath: string): Promise<void> {
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
}