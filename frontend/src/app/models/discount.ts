export interface Discount {
  id: string;
  business_id: string;
  name: string;
  code?: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bulk_discount';
  discount_value: number;
  applies_to: 'all_products' | 'specific_products' | 'categories' | 'customers';
  applies_to_ids?: string[];
  minimum_purchase: number;
  minimum_quantity: number;
  maximum_uses?: number;
  current_uses: number;
  max_uses_per_customer?: number;
  valid_from?: string;
  valid_until?: string;
  application_method: 'manual' | 'automatic' | 'coupon_code';
  priority: number;
  can_combine: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Buy X Get Y
  buy_quantity?: number;
  get_quantity?: number;
  get_discount_percentage?: number;
  
  // Bulk discount
  bulk_tiers?: BulkTier[];
}

export interface BulkTier {
  quantity: number;
  discount: number;
}

export interface DiscountCalculation {
  discount_id: string;
  discount_name: string;
  discount_type: string;
  discount_amount: number;
  applied_to_items: string[];
}

export interface DiscountResult {
  applied_discounts: DiscountCalculation[];
  total_discount: number;
  subtotal: number;
  final_total: number;
}

export interface DiscountValidation {
  valid: boolean;
  discount?: Discount;
  message?: string;
}
