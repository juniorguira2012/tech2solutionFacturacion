import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accion: string;

  @Column()
  entidadId: string;

  @Column()
  entidadTipo: string;

  @Column()
  usuarioId: string;

  @Column({ type: 'jsonb', nullable: true })
  detalles: any;

  @CreateDateColumn()
  fecha: Date;
}