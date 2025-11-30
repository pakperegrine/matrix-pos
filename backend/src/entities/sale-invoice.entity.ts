import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'sale_invoices' })
export class SaleInvoice {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  business_id: string;

  @Column({ nullable: true })
  location_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  total_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  total_profit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  discount_amount: number;

  @Column({ nullable: true })
  customer_id: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  invoice_no: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;
}
