import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  saleId: number;

  @ManyToOne(() => Sale, (sale) => sale.items)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column()
  productoId: number;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;
}
