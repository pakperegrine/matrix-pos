export interface Product {
  id: string;
  business_id?: string;
  name: string;
  sku?: string;
  price: number;
  track_inventory?: boolean;
}
