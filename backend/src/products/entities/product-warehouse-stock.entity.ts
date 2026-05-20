import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_warehouse_stock')
@Unique(['productoId', 'almacen'])
export class ProductWarehouseStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @Column()
  almacen: string;

  @Column('int', { default: 0 })
  cantidad: number;

  @ManyToOne(() => Product, (product) => product.warehouseStocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productoId' })
  producto: Product;
}