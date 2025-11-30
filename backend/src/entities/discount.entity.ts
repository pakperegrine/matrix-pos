import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('discounts')
export class Discount {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  business_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  code: string; // Coupon code (optional)

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  discount_type: string; // percentage, fixed_amount, buy_x_get_y, bulk_discount

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  discount_value: number; // Percentage (0-100) or fixed amount

  @Column({ type: 'varchar', length: 50, nullable: true })
  applies_to: string; // all_products, specific_products, categories, customers

  @Column({ type: 'json', nullable: true })
  applies_to_ids: string; // JSON array of product/category/customer IDs

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  minimum_purchase: number; // Minimum order amount required

  @Column({ type: 'int', default: 0 })
  minimum_quantity: number; // Minimum quantity required

  @Column({ type: 'int', nullable: true })
  maximum_uses: number; // Total uses allowed (null = unlimited)

  @Column({ type: 'int', default: 0 })
  current_uses: number; // Current usage count

  @Column({ type: 'int', nullable: true })
  max_uses_per_customer: number; // Uses per customer (null = unlimited)

  @Column({ type: 'datetime', nullable: true })
  valid_from: Date;

  @Column({ type: 'datetime', nullable: true })
  valid_until: Date;

  @Column({ type: 'varchar', length: 50, default: 'manual' })
  application_method: string; // manual, automatic, coupon_code

  @Column({ type: 'int', default: 0 })
  priority: number; // Higher number = higher priority when multiple discounts apply

  @Column({ type: 'tinyint', default: 1 })
  can_combine: number; // Can be combined with other discounts

  @Column({ type: 'tinyint', default: 1 })
  is_active: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Buy X Get Y specific fields
  @Column({ type: 'int', nullable: true })
  buy_quantity: number; // Buy X items

  @Column({ type: 'int', nullable: true })
  get_quantity: number; // Get Y items free/discounted

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  get_discount_percentage: number; // Discount on Y items (0-100)

  // Bulk discount tiers (JSON array)
  @Column({ type: 'json', nullable: true })
  bulk_tiers: string; // [{quantity: 10, discount: 10}, {quantity: 20, discount: 20}]
}
