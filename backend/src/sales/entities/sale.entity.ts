import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cliente: string;

  @Column({ nullable: true })
  rnc: string;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  descuento: number;

  @Column('decimal', { precision: 12, scale: 2 })
  itbis: number;

  @Column('decimal', { precision: 12, scale: 2 })
  total: number;

  @Column({ nullable: true })
  vendedorId: string;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn()
  fecha: Date;
}
