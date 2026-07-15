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
import { User } from '../../user/dto/entities/user.entity';

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

  @Column({ type: 'timestamp', nullable: true })
  fechaEntrega: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaLimite: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaDevolucion: Date;

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
