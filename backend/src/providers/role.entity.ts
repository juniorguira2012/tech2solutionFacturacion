import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // 'admin', 'vendedor', 'cajero', etc.

  @Column({ type: 'jsonb', default: {} })
  config: any; // Aquí guardaremos los módulos y niveles de acceso { modules: {...}, viewScope: '...' }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}