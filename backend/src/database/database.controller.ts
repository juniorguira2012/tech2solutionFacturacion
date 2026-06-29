// src/database/database.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express'; 
import { DatabaseService } from './database.service';
import * as fs from 'fs';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('backup')

  async downloadAndCloudBackup(@Res() res: express.Response) {
    try {
      const filePath = await this.databaseService.generateBackupFile();
      await this.databaseService.uploadToNextcloud(filePath); //esta linea se utilizara en producion y tets

      res.download(filePath, (err) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (err) {
          console.error('Error enviando el archivo al cliente:', err);
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Error procesando la copia de seguridad.' });
    }
  }
}