import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'stock_forecasts' })
export class StockForecast {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  business_id: string;

  @Index()
  @Column({ nullable: true })
  product_id: string;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  current_stock: number;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  avg_daily_sales: number;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  predicted_demand_7d: number;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  predicted_demand_30d: number;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  reorder_point: number;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  suggested_order_qty: number;

  @Column({ type: 'int', nullable: true })
  days_until_stockout: number;

  @Column({ nullable: true })
  trend: string; // increasing, decreasing, stable

  @Column({ default: false })
  is_seasonal: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  forecast_confidence: number; // 0-100%

  @Column({ type: 'datetime', nullable: true })
  calculated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;
}
