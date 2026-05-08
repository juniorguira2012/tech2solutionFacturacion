import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  codigo: string;

  @Column({ default: 'General' })
  categoria: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  stock: number;

  @Column({ default: 'Principal', nullable: true })
  almacen: string;

  @Column({ nullable: true })
  pasillo: string;

  @Column({ nullable: true })
  fila: string;

  @Column({ default: 'Unidad', nullable: true })
  unidadMedida: string;

  @Column({ default: 'Entrada', nullable: true })
  movimientoInventario: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'jsonb', default: [], nullable: true })
  camposPersonalizados: any[];

  @Column({ default: 0 })
  vendidos: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
