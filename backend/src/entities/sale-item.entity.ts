import { Entity, Column, PrimaryColumn, Index, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { SaleInvoice } from './sale-invoice.entity';
import { Product } from './product.entity';

@Entity({ name: 'sale_items' })
export class SaleItem {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  invoice_id: string;

  @ManyToOne(() => SaleInvoice, { nullable: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice: SaleInvoice;

  @Index()
  @Column({ nullable: true })
  product_id: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

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

  @CreateDateColumn()
  created_at: Date;
}
