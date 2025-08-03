import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  @Index()
  shortCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', default: 0 })
  accessCount: number;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, user => user.urls, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  constructor(
    id?: string,
    originalUrl?: string,
    shortCode?: string,
    createdAt?: Date,
    accessCount?: number,
    userId?: string,
  ) {
    this.id = id;
    this.originalUrl = originalUrl;
    this.shortCode = shortCode;
    this.createdAt = createdAt || new Date();
    this.accessCount = accessCount || 0;
    this.userId = userId;
  }
}
