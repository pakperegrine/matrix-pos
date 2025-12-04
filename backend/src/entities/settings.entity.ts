import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  business_id: string;

  @Column('varchar', { length: 36, nullable: true })
  location_id: string;

  // Business Information
  @Column('varchar', { length: 255, nullable: true })
  business_name: string;

  @Column('text', { nullable: true })
  business_address: string;

  @Column('varchar', { length: 100, nullable: true })
  business_phone: string;

  @Column('varchar', { length: 100, nullable: true })
  business_email: string;

  @Column('varchar', { length: 100, nullable: true })
  business_registration: string; // Tax/Registration number

  @Column('varchar', { length: 255, nullable: true })
  business_logo_url: string;

  // Tax Settings
  @Column('tinyint', { default: 0 })
  tax_enabled: number; // 0 = disabled, 1 = enabled

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  tax_rate: number; // e.g., 15.00 for 15%

  @Column('varchar', { length: 50, default: 'inclusive' })
  tax_type: string; // 'inclusive' or 'exclusive'

  @Column('varchar', { length: 100, nullable: true })
  tax_label: string; // e.g., "VAT", "GST", "Sales Tax"

  @Column('varchar', { length: 100, nullable: true })
  tax_number: string; // Tax registration number

  // Receipt Settings
  @Column('varchar', { length: 255, nullable: true })
  receipt_header: string;

  @Column('text', { nullable: true })
  receipt_footer: string;

  @Column('tinyint', { default: 1 })
  show_receipt_logo: number; // 0 = no, 1 = yes

  @Column('tinyint', { default: 1 })
  auto_print_receipt: number; // 0 = no, 1 = yes

  @Column('varchar', { length: 50, default: 'thermal' })
  receipt_format: string; // 'thermal', 'a4', 'letter'

  @Column('int', { default: 80 })
  receipt_width: number; // mm for thermal printers

  @Column('tinyint', { default: 1 })
  show_tax_on_receipt: number;

  @Column('tinyint', { default: 1 })
  show_business_info_on_receipt: number;

  // Currency Settings
  @Column('varchar', { length: 10, default: 'USD' })
  default_currency: string; // ISO currency code

  @Column('varchar', { length: 10, default: '$' })
  currency_symbol: string;

  @Column('varchar', { length: 20, default: 'before' })
  currency_position: string; // 'before' or 'after'

  @Column('int', { default: 2 })
  decimal_places: number;

  @Column('varchar', { length: 10, default: '.' })
  decimal_separator: string; // '.' or ','

  @Column('varchar', { length: 10, default: ',' })
  thousand_separator: string; // ',' or '.' or ' '

  // Inventory Settings
  @Column('tinyint', { default: 0 })
  allow_negative_stock: number; // 0 = no, 1 = yes

  @Column('tinyint', { default: 1 })
  track_stock_batches: number; // 0 = no, 1 = yes (FIFO)

  @Column('int', { default: 10 })
  low_stock_threshold: number; // Alert when stock below this

  @Column('tinyint', { default: 1 })
  show_low_stock_alerts: number;

  // Invoice Settings
  @Column('varchar', { length: 50, default: 'INV' })
  invoice_prefix: string; // e.g., "INV", "SI", "SALE"

  @Column('int', { default: 1 })
  invoice_start_number: number;

  @Column('int', { default: 5 })
  invoice_number_padding: number; // e.g., 5 = INV00001

  // POS Settings
  @Column('tinyint', { default: 1 })
  enable_discounts: number;

  @Column('tinyint', { default: 1 })
  enable_customer_selection: number;

  @Column('tinyint', { default: 1 })
  enable_barcode_scanner: number;

  @Column('tinyint', { default: 0 })
  require_customer_for_sale: number;

  @Column('int', { default: 20 })
  products_per_page: number;

  // Offline Settings
  @Column('tinyint', { default: 1 })
  enable_offline_mode: number;

  @Column('int', { default: 30 })
  offline_sync_interval: number; // minutes

  @Column('int', { default: 100 })
  max_offline_transactions: number;

  // Notification Settings
  @Column('tinyint', { default: 1 })
  enable_email_notifications: number;

  @Column('tinyint', { default: 1 })
  enable_low_stock_notifications: number;

  @Column('tinyint', { default: 1 })
  enable_daily_sales_report: number;

  // Date/Time Settings
  @Column('varchar', { length: 50, default: 'America/New_York' })
  timezone: string;

  @Column('varchar', { length: 50, default: 'MM/DD/YYYY' })
  date_format: string;

  @Column('varchar', { length: 50, default: 'hh:mm A' })
  time_format: string;

  // System Settings
  @Column('varchar', { length: 50, default: 'en' })
  language: string; // 'en', 'es', 'fr', etc.

  @Column('int', { default: 30 })
  session_timeout: number; // minutes

  @Column('tinyint', { default: 1 })
  enable_sound_effects: number;

  @Column('tinyint', { default: 1 })
  enable_animations: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
