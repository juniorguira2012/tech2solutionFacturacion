import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../providers/user.entity';

@Entity('comodatos')
export class Comodato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productoId' })
  producto: Product;

  @Column()
  responsable: string;

  @Column({ type: 'text', nullable: true })
  nota: string;

  @Column({ nullable: true })
  usuarioId: number;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column({ default: 'activo' })
  estado: string; // 'activo', 'devuelto', 'perdido'

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
