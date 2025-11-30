export interface Product {
  id: string;
  business_id?: string;
  scope?: string;
  location_id?: string;
  category_id?: string;
  unit_id?: string;
  name: string;
  barcode?: string;
  sku?: string;
  price: number;
  cost?: number;
  track_inventory?: boolean;
  allow_negative_stock?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
