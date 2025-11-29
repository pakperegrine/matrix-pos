import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column({ nullable: true })
  business_id: string;

  @Column({ default: 'central' })
  scope: string;

  @Column({ nullable: true })
  location_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'tinyint', default: 1 })
  track_inventory: number;
}
