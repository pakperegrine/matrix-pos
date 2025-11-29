import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'sale_items' })
export class SaleItem {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  invoice_id: string;

  @Index()
  @Column({ nullable: true })
  product_id: string;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  sale_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  fifo_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  total_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  profit: number;
}
