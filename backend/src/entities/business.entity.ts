import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'businesses' })
export class Business {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  owner_id: string;

  @Column({ default: 'active', length: 20 })
  status: string; // active, suspended, closed

  @Column({ nullable: true, length: 50 })
  business_type: string;

  @CreateDateColumn()
  registration_date: Date;

  @Column({ default: 'basic', length: 50 })
  subscription_plan: string;

  @Column({ type: 'datetime', nullable: true })
  subscription_expires: Date;
}
