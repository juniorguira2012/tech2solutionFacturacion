import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory_batches')
export class InventoryBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productoId' })
  producto: Product;

  @Column()
  numeroLote: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad: number;

  @Column()
  almacen: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaVencimiento: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}