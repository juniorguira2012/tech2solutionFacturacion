import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CountItem } from '../../inventory-counts/entities/count-item.entity';

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

  @Column({ default: 0 })
  stock: number;

  // ─── Imagen ────────────────────────────────────────────────────────────────
  // Campo dedicado para URL o base64. Antes se guardaba dentro de
  // camposPersonalizados como { nombre: 'imagenProducto', valor: '...' }.
  // Ahora vive aquí directamente.
  @Column({ type: 'text', nullable: true })
  imagen: string;

  // ─── Almacén / Ubicación ───────────────────────────────────────────────────
  @Column({ default: 'Principal', nullable: true })
  almacen: string;

  @Column({ nullable: true })
  pasillo: string;

  @Column({ nullable: true })
  fila: string;

  // Campo combinado de ubicación (ej. "Pasillo A - Fila 3").
  // Se puede calcular en el servicio o dejar que el frontend lo envíe.
  @Column({ nullable: true })
  ubicacion: string;

  // ─── Unidad y movimiento ───────────────────────────────────────────────────
  @Column({ default: 'Unidad', nullable: true })
  unidadMedida: string;

  @Column({ default: 'Entrada', nullable: true })
  movimientoInventario: string;

  // ─── Descripción y campos personalizados ──────────────────────────────────
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'jsonb', default: [], nullable: true })
  camposPersonalizados: any[];

  // ─── Estadísticas ─────────────────────────────────────────────────────────
  @Column({ default: 0 })
  vendidos: number;

  // ─── Estado ───────────────────────────────────────────────────────────────
  @Column({ default: true })
  isActive: boolean;

  // ─── Relación con conteos de inventario ───────────────────────────────────
  // Conecta Product directamente con CountItem en lugar de solo guardar
  // el id como número plano.
  @OneToMany(() => CountItem, (item) => item.productoId, { cascade: false })
  countItems: CountItem[];

  // ─── Timestamps ───────────────────────────────────────────────────────────
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}