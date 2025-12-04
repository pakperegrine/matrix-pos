import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CashShift } from './cash-shift.entity';

@Entity('cash_movements')
@Index(['shiftId'])
@Index(['movementType'])
@Index(['createdAt'])
export class CashMovement {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'shift_id' })
  shiftId: string;

  @Column({ type: 'varchar', length: 255, name: 'business_id' })
  businessId: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'location_id' })
  locationId: string;

  @Column({ type: 'varchar', length: 20, name: 'movement_type' })
  movementType: 'cash_in' | 'cash_out' | 'cash_drop' | 'sale' | 'refund';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 36, name: 'performed_by' })
  performedBy: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'approved_by' })
  approvedBy: string;

  @Column({ type: 'datetime', nullable: true, name: 'approved_at' })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'reference_type' })
  referenceType: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'reference_id' })
  referenceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => CashShift)
  @JoinColumn({ name: 'shift_id' })
  shift: CashShift;
}
