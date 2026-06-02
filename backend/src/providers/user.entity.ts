import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Por seguridad, no devuelve el password en consultas normales
  password: string;

  @Column({ default: 'user' })
  rol: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, select: false })
  resetToken?: string;

  @Column({ nullable: true, type: 'timestamp', select: false })
  resetTokenExpiresAt?: Date;
}