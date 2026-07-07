import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Product } from '../../products/entities/product.entity'; // ⚠️ Revisa que la ruta a tu entidad de Producto sea correcta

@Entity('inventory_batches') // Nombre de la tabla en PostgreSQL
export class InventoryBatch {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero_lote', type: 'varchar', length: 100 })
  numeroLote: string;

  @Column({ type: 'int', default: 0 })
  cantidad: number;

  @Column({ type: 'varchar', length: 150, default: 'Principal' })
  almacen: string;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento: Date;

  // 🌟 RELACIÓN: Muchos lotes pertenecen a un solo producto
  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' }) // Nombre de la llave foránea en la BD
  producto: Product;

  // Guardamos también el ID numérico directo para facilitar las validaciones en los DTOs
  @Column({ name: 'producto_id' })
  productoId: number;

  // Métricas de auditoría automáticas
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}