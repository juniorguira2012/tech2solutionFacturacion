import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CountItem } from '../../inventory-counts/entities/count-item.entity';
import { ProductWarehouseStock } from './product-warehouse-stock.entity';
import { Provider } from '../../providers/provider.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  codigo: string;

  @Column({ nullable: true })
  modelo: string;

  @Column({ nullable: true })
  serie: string;

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

  @Column({ nullable: true })
  proveedorId: number;

  @ManyToOne(() => Provider, { nullable: true, eager: true })
  @JoinColumn({ name: 'proveedorId' }) // Especifica que la columna 'proveedorId' es la clave foránea
  proveedor: Provider;

  // Relación para el stock desglosado por almacén
  @OneToMany(() => ProductWarehouseStock, (stock) => stock.producto, { cascade: true, eager: true })
  warehouseStocks: ProductWarehouseStock[];

  // ─── Timestamps ───────────────────────────────────────────────────────────
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}