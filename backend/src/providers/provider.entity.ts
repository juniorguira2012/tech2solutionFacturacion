import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  rnc: string; // O cédula/identificación fiscal

  @Column({ nullable: true })
  telefono: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true }) // nullable: true por si no todos los proveedores tienen correo
  correo: string;

  @Column({ nullable: true })
  direccion: string;

@Column({ type: 'varchar', length: 255, nullable: true })
  ofrece: string;
}