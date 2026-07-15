import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Product } from '../../products/entities/product.entity'; // ⚠️ Revisa que la ruta a tu entidad de Producto sea correcta

@Entity('inventory_batches') // Nombre de la tabla en PostgreSQL
export class InventoryBatch {
  
  @PrimaryGeneratedColumn()
  id: number;

  // 💡 MEJORA: Aceptamos 'lote' como alias para 'numeroLote' desde el DTO.
  @Expose({ name: 'lote' }) 
  @Column({ name: 'numero_lote', type: 'varchar', length: 100, nullable: true, default: 'Sin Lote' })
  numeroLote: string;

  @Column({ type: 'int', default: 0 })
  cantidad: number;

  @Column({ type: 'varchar', length: 150, default: 'Principal' })
  almacen: string;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento: Date;

 @ManyToOne(() => Product, { onDelete: 'CASCADE' })
 @JoinColumn({ name: 'producto_id' }) 
 producto: Product;

  // Se queda exactamente igual, apuntando al mismo nombre físico
  // @Column({ name: 'producto_id' })
  // productoId: number;
  
  // Métricas de auditoría automáticas
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}