import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: false })
  business_id: string;

  @Column({ default: 'central' })
  scope: string;

  @Column({ nullable: true })
  location_id: string;

  @Column({ nullable: true })
  category_id: string;

  @Column({ nullable: true })
  unit_id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true, default: 0 })
  cost: number;

  @Column({ type: 'tinyint', default: 1 })
  track_inventory: number;

  @Column({ type: 'tinyint', default: 0 })
  allow_negative_stock: number;

  @Column({ type: 'tinyint', default: 1, name: 'status' })
  is_active: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
