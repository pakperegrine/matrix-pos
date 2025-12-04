import { Entity, Column, PrimaryColumn, Index, CreateDateColumn } from 'typeorm';

@Entity({ name: 'user_sessions' })
export class UserSession {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: false })
  user_id: string;

  @Index()
  @Column({ nullable: false })
  business_id: string;

  @Column({ nullable: true })
  location_id: string;

  @CreateDateColumn()
  login_time: Date;

  @Column({ type: 'datetime', nullable: true })
  logout_time: Date;

  @Column({ nullable: true, length: 45 })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ default: 'active', length: 20 })
  status: string;
}
