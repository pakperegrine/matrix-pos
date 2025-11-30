import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('customers')
export class Customer {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  business_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'varchar', length: 50, default: 'regular' })
  customer_type: string; // regular, wholesale, vip

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  credit_limit: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  current_balance: number;

  @Column({ type: 'int', default: 0 })
  loyalty_points: number;

  @Column({ type: 'varchar', length: 50, default: 'bronze' })
  loyalty_tier: string; // bronze, silver, gold, platinum

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  total_purchases: number;

  @Column({ type: 'int', default: 0 })
  purchase_count: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  discount_percentage: number; // Default discount for this customer

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'tinyint', default: 1 })
  is_active: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  last_purchase_date: Date;
}
