import { Entity, Column, PrimaryColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('drawer_events')
@Index(['shiftId'])
@Index(['eventType'])
@Index(['createdAt'])
export class DrawerEvent {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'shift_id' })
  shiftId: string;

  @Column({ type: 'varchar', length: 255, name: 'business_id' })
  businessId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'terminal_id' })
  terminalId: string;

  @Column({ type: 'varchar', length: 30, name: 'event_type' })
  eventType: 'manual_open' | 'sale' | 'refund' | 'cash_movement' | 'shift_open' | 'shift_close';

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 36, name: 'opened_by' })
  openedBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'reference_type' })
  referenceType: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'reference_id' })
  referenceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
