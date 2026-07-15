import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/dto/entities/user.entity';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userIdentifier: string; // email o username usado para el login

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  loginDate: Date;

  @Column()
  ipAddress: string;

  @Column({ type: 'text' })
  userAgent: string;

  // Relación opcional para poder navegar desde el historial al usuario
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}