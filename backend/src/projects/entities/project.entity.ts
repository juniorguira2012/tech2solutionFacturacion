import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('fiber_projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ length: 160, nullable: true })
  cliente?: string;

  @Column({ length: 160, nullable: true })
  zona?: string;

  @Column({ default: 'planificado' })
  estado: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  presupuesto: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  inversion: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  kilometrosPlanificados: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  kilometrosInstalados: number;

  @Column({ length: 120, nullable: true })
  tipoFibra?: string;

  @Column({ type: 'int', default: 0 })
  cantidadFibraPlanificada: number;

  @Column({ type: 'int', default: 0 })
  cantidadFibraUsada: number;

  @Column({ type: 'date', nullable: true })
  fechaInicio?: string;

  @Column({ type: 'date', nullable: true })
  fechaFin?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
