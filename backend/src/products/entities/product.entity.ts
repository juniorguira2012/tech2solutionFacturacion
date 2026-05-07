import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string; // Cambiamos 'name' a 'nombre' para que coincida con tu React

  @Column({ nullable: true })
  codigo: string;

  @Column({ default: 'General' })
  categoria: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column()
  stock: number;

  @Column({ default: 0 })
  vendidos: number;

  @Column({ default: true })
  isActive: boolean;
}