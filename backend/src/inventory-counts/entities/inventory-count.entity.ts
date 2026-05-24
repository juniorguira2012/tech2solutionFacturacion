import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CountItem } from './count-item.entity';

export enum ConteoEstado {
  EN_PROGRESO = 'EN_PROGRESO', // Asegúrate de que este valor coincida con lo que hay en la DB
  AJUSTES_PUBLICADOS = 'Ajustes Publicados', // Este es el valor que causaba el error
  CANCELADO = 'CANCELADO', // Asegúrate de que este valor coincida con lo que hay en la DB
}

@Entity('inventory_counts')
export class InventoryCount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  almacen: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ConteoEstado,
    default: ConteoEstado.EN_PROGRESO,
  })
  estado: ConteoEstado;

  @Column({ type: 'int', default: 0 })
  totalProductos: number;

  @Column({ type: 'float', default: 0 })
  totalVariacion: number;

  @OneToMany(() => CountItem, (item) => item.conteo, { cascade: true })
  items: CountItem[];

  @CreateDateColumn()
  createdAt: Date;
}