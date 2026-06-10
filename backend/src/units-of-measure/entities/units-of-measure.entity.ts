// 📄 src/units-of-measure/entities/units-of-measure.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('unidades_medida') // O el nombre de tu tabla en Postgres
export class UnidadMedida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column({ default: true })
  activo: boolean;
}