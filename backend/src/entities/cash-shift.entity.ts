import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cash_shifts')
@Index(['businessId', 'cashierId'])
@Index(['status'])
@Index(['openingTime'])
export class CashShift {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'business_id' })
  businessId: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'location_id' })
  locationId: string;

  @Column({ type: 'varchar', length: 36, name: 'cashier_id' })
  cashierId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'terminal_id' })
  terminalId: string;

  @Column({ type: 'int', nullable: true, name: 'shift_number' })
  shiftNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'opening_float' })
  openingFloat: number;

  @Column({ type: 'datetime', name: 'opening_time' })
  openingTime: Date;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'opening_approved_by' })
  openingApprovedBy: string;

  @Column({ type: 'datetime', nullable: true, name: 'opening_approved_at' })
  openingApprovedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'expected_cash' })
  expectedCash: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'actual_cash' })
  actualCash: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  variance: number;

  @Column({ type: 'datetime', nullable: true, name: 'closing_time' })
  closingTime: Date;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'closing_approved_by' })
  closingApprovedBy: string;

  @Column({ type: 'datetime', nullable: true, name: 'closing_approved_at' })
  closingApprovedAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: 'open' | 'closed' | 'reconciling';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_cash_sales' })
  totalCashSales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_card_sales' })
  totalCardSales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_sales' })
  totalSales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_discounts' })
  totalDiscounts: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_refunds' })
  totalRefunds: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_voids' })
  totalVoids: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
