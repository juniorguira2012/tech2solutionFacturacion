import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum SerialStatus {
  DISPONIBLE = 'disponible',
  VENDIDO = 'vendido',
  EN_REPARACION = 'en_reparacion',
  DESCARTADO = 'descartado',
  EN_COMODATO = 'en_comodato',
  ASIGNADO_TECNICO = 'asignado_tecnico',
}

@Entity('product_serials')
@Index(['serialNumber', 'productoId'], { unique: true }) // Un serial es único por producto
export class ProductSerial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  serialNumber: string;

  @ManyToOne(() => Product, (product) => product.seriales, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'productoId' })
  producto: Product;

  @Column()
  productoId: number;

  @Column({ type: 'enum', enum: SerialStatus, default: SerialStatus.DISPONIBLE })
  status: SerialStatus;

  @Column({ length: 100, comment: 'Almacén donde se encuentra físicamente el serial' })
  almacen: string;

  // 🌟 CORRECCIÓN: Columna para registrar notas generales o motivos de asignación
  @Column({ type: 'text', nullable: true, comment: 'Nota general o de entrega del serial' })
  nota: string;

  // 🌟 CORRECCIÓN: Columna requerida por el MovementsService para mitigar el error TS2339
  @Column({ type: 'text', nullable: true, comment: 'Última nota de devolución registrada por el técnico' })
  lastReturnNote: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}