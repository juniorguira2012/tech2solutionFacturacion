import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Technician } from './technician.entity';
import { User } from '../../providers/user.entity';

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
  nuevoStock?: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  costoUnitario?: number;

  @Column({ nullable: true })
  referencia?: string;

  @Column({ nullable: true })
  usuarioId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuarioId' })
  usuario?: User;

  @Column({ nullable: true })
  technicianId?: number;

  @ManyToOne(() => Technician, { nullable: true })
  @JoinColumn({ name: 'technicianId' })
  technician?: Technician;

  @Column({ nullable: true })
  almacenOrigen: string;

  @Column({ nullable: true })
  almacenDestino: string;

  @CreateDateColumn()
  createdAt: Date;
}
