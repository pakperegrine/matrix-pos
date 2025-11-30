import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'currencies' })
export class Currency {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  business_id: string;

  @Column({ length: 3 })
  code: string; // USD, EUR, GBP, etc.

  @Column()
  name: string; // US Dollar, Euro, British Pound

  @Column()
  symbol: string; // $, €, £

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 1 })
  exchange_rate: number; // Rate relative to base currency

  @Column({ default: false })
  is_base: boolean; // Base currency (exchange_rate = 1)

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'datetime', nullable: true })
  rate_updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;
}
