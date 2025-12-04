import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'businesses' })
export class Business {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  owner_id: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active, suspended, closed

  @Column({ type: 'varchar', length: 100, nullable: true })
  business_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registration_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tax_number: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ type: 'varchar', length: 50, default: 'basic' })
  subscription_plan: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  subscription_status: string;

  @Column({ type: 'date', nullable: true })
  trial_ends_at: Date;

  @Column({ type: 'datetime', nullable: true })
  subscription_expires: Date;

  @Column({ type: 'datetime', nullable: true })
  registration_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
