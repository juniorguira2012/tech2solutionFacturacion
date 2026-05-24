import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { InventoryCount } from './inventory-count.entity';

@Entity('inventory_count_items')
export class InventoryCountItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productoId: number;

  @Column()
  productoNombre: string;

  @Column()
  codigo: string;

  @Column({ type: 'float', default: 0 })
  cantidadContada: number;

  @Column({ type: 'float', default: 0 })
  cantidadSistema: number;

  @Column({ type: 'float', default: 0 })
  precioUnitario: number;

  @Column({ default: 'Unidad' })
  unidadMedida: string;

  @Column({ type: 'float', default: 0 })
  diferencia: number;

  @Column({ type: 'float', default: 0 })
  costoVariacion: number;

  @ManyToOne(() => InventoryCount, (count) => count.items, { onDelete: 'CASCADE' })
  inventoryCount: InventoryCount;
}