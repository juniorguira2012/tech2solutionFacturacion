import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryCount } from './inventory-count.entity';

@Entity('count_items')
export class CountItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InventoryCount, (conteo) => conteo.items, {
    onDelete: 'CASCADE',
  })
  conteo: InventoryCount;

  @Column()
  productoId: number;

  @Column()
  productoNombre: string;

  @Column({ nullable: true })
  codigo: string;

  @Column()
  cantidadSistema: number;

  @Column({ nullable: true })
  cantidadContada: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario: number;

  @Column()
  unidadMedida: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campos calculados (no se guardan en BD)
  get diferencia(): number {
    if (this.cantidadContada === null || this.cantidadContada === undefined) {
      return 0;
    }
    return this.cantidadContada - this.cantidadSistema;
  }

  get costoVariacion(): number {
    return this.diferencia * Number(this.precioUnitario);
  }
}
