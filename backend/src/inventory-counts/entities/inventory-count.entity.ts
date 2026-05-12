import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CountItem } from './count-item.entity';

export enum ConteoEstado {
  EN_PROGRESO = 'En Progreso',
  CONTADO = 'Contado',
  AJUSTES_PUBLICADOS = 'Ajustes Publicados',
  CANCELADO = 'Cancelado',
}

@Entity('inventory_counts')
export class InventoryCount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  almacen: string;

  @Column({
    type: 'enum',
    enum: ConteoEstado,
    default: ConteoEstado.EN_PROGRESO,
  })
  estado: ConteoEstado;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ default: 0 })
  totalProductos: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalVariacion: number;

  @OneToMany(() => CountItem, (item) => item.conteo, {
    cascade: true,
    eager: true,
  })
  items: CountItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
