import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  business_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password_hash: string;

  @Index()
  @Column({ default: 'cashier', length: 50 })
  role: string; // owner, admin, manager, cashier

  @Index()
  @Column({ nullable: true })
  location_id: string;

  @Index()
  @Column({ default: 'active', length: 20 })
  status: string; // active, inactive, suspended

  @Column({ type: 'text', nullable: true })
  permissions: string; // JSON

  @Column({ type: 'datetime', nullable: true })
  last_login: Date;

  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
