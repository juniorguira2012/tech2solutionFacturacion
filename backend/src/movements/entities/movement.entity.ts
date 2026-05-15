import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('movements')
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productoId' })
  producto: Product;

  @Column()
  tipo: string; // ENTRADA, SALIDA, DESPACHAR, AJUSTE

  @Column()
  cantidad: number;

  @Column({ nullable: true })
  nota: string;

  @Column({ nullable: true })
  usuarioId: string;

  @CreateDateColumn()
  createdAt: Date;
}
