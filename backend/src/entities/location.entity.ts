import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'locations' })
export class Location {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: false })
  business_id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true, length: 100 })
  city: string;

  @Column({ nullable: true, length: 100 })
  state: string;

  @Column({ nullable: true, length: 20 })
  postal_code: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ nullable: true, length: 50 })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  manager_id: string;

  @Index()
  @Column({ default: 'active', length: 20 })
  status: string; // active, inactive, closed

  @Column({ type: 'text', nullable: true })
  opening_hours: string;

  @Column({ type: 'text', nullable: true })
  settings: string; // JSON

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
