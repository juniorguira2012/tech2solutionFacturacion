import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { EmailService } from '../user/email.service';

@Injectable()
export class LowStockAlertService {
  private readonly logger = new Logger(LowStockAlertService.name);
  private readonly alertedProductIds = new Set<number>();

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly emailService: EmailService,
  ) {}

  @Cron('*/5 * * * *')
  async checkLowStock() {
    const recipients = (process.env.LOW_STOCK_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);

    if (recipients.length === 0) return;

    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { nombre: 'ASC' },
    });
    const lowStockProducts = products.filter(product =>
      Number(product.stock) <= Number(product.stockMinimo ?? 5),
    );
    const lowStockIds = new Set(lowStockProducts.map(product => product.id));

    for (const product of products) {
      if (!lowStockIds.has(product.id)) {
        this.alertedProductIds.delete(product.id);
      }
    }

    const productsToAlert = lowStockProducts.filter(
      product => !this.alertedProductIds.has(product.id),
    );
    if (productsToAlert.length === 0) return;

    const systemUrl = (
      process.env.SYSTEM_URL || process.env.FRONTEND_URL || 'http://localhost:5174'
    ).replace(/\/$/, '');
    const rows = productsToAlert
      .map(product => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd">${product.nombre}</td>
          <td style="padding:8px;border:1px solid #ddd">${product.stock}</td>
          <td style="padding:8px;border:1px solid #ddd">${product.stockMinimo ?? 5}</td>
          <td style="padding:8px;border:1px solid #ddd">${product.almacen || 'Principal'}</td>
        </tr>`)
      .join('');

    try {
      await this.emailService.sendMail(
        recipients.join(', '),
        'Alerta de stock bajo',
        `<h2>Productos con stock bajo</h2>
         <p>Los siguientes productos requieren reposición:</p>
         <table style="border-collapse:collapse">
           <thead><tr>
             <th style="padding:8px;border:1px solid #ddd">Producto</th>
             <th style="padding:8px;border:1px solid #ddd">Stock actual</th>
             <th style="padding:8px;border:1px solid #ddd">Stock mínimo</th>
             <th style="padding:8px;border:1px solid #ddd">Almacén</th>
           </tr></thead>
           <tbody>${rows}</tbody>
         </table>
         <p style="margin-top:24px">
           <a href="${systemUrl}"
              style="display:inline-block;padding:12px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">
             Abrir sistema
           </a>
         </p>
         <p>Enlace directo: <a href="${systemUrl}">${systemUrl}</a></p>`,
      );

      productsToAlert.forEach(product => this.alertedProductIds.add(product.id));
    } catch (error) {
      this.logger.error('No se pudo enviar la alerta de stock bajo', error as Error);
    }
  }
}
