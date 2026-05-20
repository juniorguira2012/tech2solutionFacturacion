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
}