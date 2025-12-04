import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'business_statistics' })
export class BusinessStatistic {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: false })
  business_id: string;

  @Index()
  @Column({ nullable: true })
  location_id: string;

  @Index()
  @Column({ type: 'date', nullable: false })
  stat_date: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_sales: number;

  @Column({ type: 'int', default: 0 })
  total_transactions: number;

  @Column({ type: 'int', default: 0 })
  total_customers: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  total_profit: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  average_transaction: number;

  @Column({ nullable: true })
  top_product_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
