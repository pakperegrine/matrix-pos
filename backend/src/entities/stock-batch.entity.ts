import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'stock_batches' })
export class StockBatch {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  product_id: string;

  @Column({ nullable: true })
  location_id: string;

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  cost_price: number;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;
}
