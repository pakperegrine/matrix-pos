export interface Settings {
  id: string;
  business_id: string;

  // Business Information
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_registration: string;
  business_logo_url: string;

  // Tax Settings
  tax_enabled: number;
  tax_rate: number;
  tax_type: string;
  tax_label: string;
  tax_number: string;

  // Receipt Settings
  receipt_header: string;
  receipt_footer: string;
  show_receipt_logo: number;
  auto_print_receipt: number;
  receipt_format: string;
  receipt_width: number;
  show_tax_on_receipt: number;
  show_business_info_on_receipt: number;

  // Currency Settings
  default_currency: string;
  currency_symbol: string;
  currency_position: string;
  decimal_places: number;
  decimal_separator: string;
  thousand_separator: string;

  // Inventory Settings
  allow_negative_stock: number;
  track_stock_batches: number;
  low_stock_threshold: number;
  show_low_stock_alerts: number;

  // Invoice Settings
  invoice_prefix: string;
  invoice_start_number: number;
  invoice_number_padding: number;

  // POS Settings
  enable_discounts: number;
  enable_customer_selection: number;
  enable_barcode_scanner: number;
  require_customer_for_sale: number;
  products_per_page: number;

  // Offline Settings
  enable_offline_mode: number;
  offline_sync_interval: number;
  max_offline_transactions: number;

  // Notification Settings
  enable_email_notifications: number;
  enable_low_stock_notifications: number;
  enable_daily_sales_report: number;

  // Date/Time Settings
  timezone: string;
  date_format: string;
  time_format: string;

  // System Settings
  language: string;
  session_timeout: number;
  enable_sound_effects: number;
  enable_animations: number;

  created_at: Date;
  updated_at: Date;
}
