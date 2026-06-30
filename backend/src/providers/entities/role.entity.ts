import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'jsonb', default: {} })
  config: any;
}