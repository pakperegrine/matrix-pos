export interface Customer {
  id?: string;
  business_id?: string;
  location_id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  date_of_birth?: string | Date;
  customer_type?: 'regular' | 'wholesale' | 'vip';
  credit_limit?: number;
  current_balance?: number;
  loyalty_points?: number;
  loyalty_tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_purchases?: number;
  purchase_count?: number;
  discount_percentage?: number;
  notes?: string;
  is_active?: boolean | number;
  created_at?: Date;
  updated_at?: Date;
  last_purchase_date?: Date;
}

export interface CustomerStatistics {
  customer_id: string;
  name: string;
  total_purchases: number;
  purchase_count: number;
  loyalty_points: number;
  loyalty_tier: string;
  current_balance: number;
  credit_limit: number;
  last_purchase_date: Date | null;
  customer_since: Date;
  average_purchase: number;
}
