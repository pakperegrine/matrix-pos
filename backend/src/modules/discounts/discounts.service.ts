import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Discount } from '../../entities/discount.entity';

export interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  category_id?: string;
}

export interface DiscountCalculation {
  discount_id: string;
  discount_name: string;
  discount_type: string;
  discount_amount: number;
  applied_to_items: string[];
}

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async findAll(
    businessId: string,
    options: {
      is_active?: number;
      discount_type?: string;
      location_id?: string;
    },
  ) {
    const query = this.discountRepository.createQueryBuilder('discount');
    query.where('discount.business_id = :businessId', { businessId });

    if (options.location_id) {
      query.andWhere('discount.location_id = :locationId', { locationId: options.location_id });
    }

    if (options.is_active !== undefined) {
      query.andWhere('discount.is_active = :is_active', {
        is_active: options.is_active,
      });
    }

    if (options.discount_type) {
      query.andWhere('discount.discount_type = :discount_type', {
        discount_type: options.discount_type,
      });
    }

    query.orderBy('discount.created_at', 'DESC');

    const [discounts, total] = await query.getManyAndCount();

    return {
      discounts,
      total,
    };
  }

  async findActiveDiscounts(businessId: string): Promise<Discount[]> {
    const now = new Date();

    const query = this.discountRepository.createQueryBuilder('discount');
    query.where('discount.business_id = :businessId', { businessId });
    query.andWhere('discount.is_active = 1');
    
    // Check date validity
    query.andWhere(
      '(discount.valid_from IS NULL OR discount.valid_from <= :now)',
      { now },
    );
    query.andWhere(
      '(discount.valid_until IS NULL OR discount.valid_until >= :now)',
      { now },
    );

    // Check usage limits
    query.andWhere(
      '(discount.maximum_uses IS NULL OR discount.current_uses < discount.maximum_uses)',
    );

    query.orderBy('discount.priority', 'DESC');

    return query.getMany();
  }

  async findOne(businessId: string, id: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { id, business_id: businessId },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  async create(businessId: string, discountData: Partial<Discount>): Promise<Discount> {
    // Validate discount data
    this.validateDiscountData(discountData);

    // Check for duplicate coupon code
    if (discountData.code) {
      const existing = await this.discountRepository.findOne({
        where: { business_id: businessId, code: discountData.code },
      });
      if (existing) {
        throw new BadRequestException('Coupon code already exists');
      }
    }

    const discount = this.discountRepository.create({
      ...discountData,
      business_id: businessId,
    });

    return this.discountRepository.save(discount);
  }

  async update(
    businessId: string,
    id: string,
    discountData: Partial<Discount>,
  ): Promise<Discount> {
    const discount = await this.findOne(businessId, id);

    // Validate discount data
    this.validateDiscountData(discountData);

    // Check coupon code uniqueness if changing
    if (discountData.code && discountData.code !== discount.code) {
      const existing = await this.discountRepository.findOne({
        where: { business_id: businessId, code: discountData.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Coupon code already exists');
      }
    }

    Object.assign(discount, discountData);
    return this.discountRepository.save(discount);
  }

  async delete(businessId: string, id: string): Promise<void> {
    const discount = await this.findOne(businessId, id);
    await this.discountRepository.remove(discount);
  }

  async validateCouponCode(
    businessId: string,
    code: string,
    cartTotal: number,
    customerId?: string,
  ): Promise<{ valid: boolean; discount?: Discount; message?: string }> {
    const discount = await this.discountRepository.findOne({
      where: { business_id: businessId, code, is_active: 1 },
    });

    if (!discount) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    // Check date validity
    const now = new Date();
    if (discount.valid_from && new Date(discount.valid_from) > now) {
      return { valid: false, message: 'Coupon not yet valid' };
    }
    if (discount.valid_until && new Date(discount.valid_until) < now) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check usage limits
    if (discount.maximum_uses && discount.current_uses >= discount.maximum_uses) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check minimum purchase
    if (discount.minimum_purchase > 0 && cartTotal < discount.minimum_purchase) {
      return {
        valid: false,
        message: `Minimum purchase of $${discount.minimum_purchase} required`,
      };
    }

    // Check customer-specific discounts
    if (discount.applies_to === 'customers' && customerId) {
      const customerIds = this.parseJsonField(discount.applies_to_ids);
      if (!customerIds.includes(customerId)) {
        return { valid: false, message: 'Coupon not valid for this customer' };
      }
    }

    return { valid: true, discount };
  }

  async calculateDiscounts(
    businessId: string,
    cartItems: CartItem[],
    customerId?: string,
    couponCodes?: string[],
  ): Promise<{
    applied_discounts: DiscountCalculation[];
    total_discount: number;
    subtotal: number;
    final_total: number;
  }> {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    // Get active discounts
    const activeDiscounts = await this.findActiveDiscounts(businessId);

    // Add coupon discounts
    const couponDiscounts: Discount[] = [];
    if (couponCodes && couponCodes.length > 0) {
      for (const code of couponCodes) {
        const validation = await this.validateCouponCode(
          businessId,
          code,
          subtotal,
          customerId,
        );
        if (validation.valid && validation.discount) {
          couponDiscounts.push(validation.discount);
        }
      }
    }

    // Filter applicable discounts
    const applicableDiscounts = [
      ...activeDiscounts.filter(d => d.application_method === 'automatic'),
      ...couponDiscounts,
    ].filter(d => this.isDiscountApplicable(d, cartItems, subtotal, customerId));

    // Sort by priority
    applicableDiscounts.sort((a, b) => b.priority - a.priority);

    // Calculate discounts
    const appliedDiscounts: DiscountCalculation[] = [];
    let totalDiscount = 0;

    for (const discount of applicableDiscounts) {
      const calculation = this.calculateSingleDiscount(discount, cartItems, subtotal);
      
      if (calculation.discount_amount > 0) {
        appliedDiscounts.push(calculation);
        totalDiscount += calculation.discount_amount;

        // If discount can't be combined, stop here
        if (!discount.can_combine) {
          break;
        }
      }
    }

    return {
      applied_discounts: appliedDiscounts,
      total_discount: totalDiscount,
      subtotal,
      final_total: Math.max(0, subtotal - totalDiscount),
    };
  }

  private calculateSingleDiscount(
    discount: Discount,
    cartItems: CartItem[],
    subtotal: number,
  ): DiscountCalculation {
    let discountAmount = 0;
    const appliedToItems: string[] = [];

    switch (discount.discount_type) {
      case 'percentage':
        discountAmount = (subtotal * discount.discount_value) / 100;
        appliedToItems.push(...cartItems.map(item => item.product_id));
        break;

      case 'fixed_amount':
        discountAmount = Math.min(discount.discount_value, subtotal);
        appliedToItems.push(...cartItems.map(item => item.product_id));
        break;

      case 'buy_x_get_y':
        const result = this.calculateBuyXGetY(discount, cartItems);
        discountAmount = result.discount;
        appliedToItems.push(...result.items);
        break;

      case 'bulk_discount':
        const bulkResult = this.calculateBulkDiscount(discount, cartItems);
        discountAmount = bulkResult.discount;
        appliedToItems.push(...bulkResult.items);
        break;

      default:
        break;
    }

    return {
      discount_id: discount.id,
      discount_name: discount.name,
      discount_type: discount.discount_type,
      discount_amount: discountAmount,
      applied_to_items: appliedToItems,
    };
  }

  private calculateBuyXGetY(
    discount: Discount,
    cartItems: CartItem[],
  ): { discount: number; items: string[] } {
    if (!discount.buy_quantity || !discount.get_quantity) {
      return { discount: 0, items: [] };
    }

    const applicableItems = this.filterApplicableItems(discount, cartItems);
    const totalQty = applicableItems.reduce((sum, item) => sum + item.quantity, 0);

    const sets = Math.floor(totalQty / discount.buy_quantity);
    const freeItems = sets * discount.get_quantity;

    if (freeItems === 0) {
      return { discount: 0, items: [] };
    }

    // Calculate discount on free items
    let discountAmount = 0;
    let remainingFree = freeItems;
    const appliedItems: string[] = [];

    for (const item of applicableItems) {
      if (remainingFree === 0) break;

      const itemsToDiscount = Math.min(remainingFree, item.quantity);
      const itemDiscount =
        (itemsToDiscount * item.unit_price * (discount.get_discount_percentage || 100)) / 100;

      discountAmount += itemDiscount;
      appliedItems.push(item.product_id);
      remainingFree -= itemsToDiscount;
    }

    return { discount: discountAmount, items: appliedItems };
  }

  private calculateBulkDiscount(
    discount: Discount,
    cartItems: CartItem[],
  ): { discount: number; items: string[] } {
    const bulkTiers = this.parseJsonField(discount.bulk_tiers);
    if (!bulkTiers || bulkTiers.length === 0) {
      return { discount: 0, items: [] };
    }

    const applicableItems = this.filterApplicableItems(discount, cartItems);
    const totalQty = applicableItems.reduce((sum, item) => sum + item.quantity, 0);

    // Find applicable tier
    const sortedTiers = bulkTiers.sort((a: any, b: any) => b.quantity - a.quantity);
    const tier = sortedTiers.find((t: any) => totalQty >= t.quantity);

    if (!tier) {
      return { discount: 0, items: [] };
    }

    const subtotal = applicableItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    const discountAmount = (subtotal * tier.discount) / 100;
    const appliedItems = applicableItems.map(item => item.product_id);

    return { discount: discountAmount, items: appliedItems };
  }

  private isDiscountApplicable(
    discount: Discount,
    cartItems: CartItem[],
    subtotal: number,
    customerId?: string,
  ): boolean {
    // Check minimum purchase
    if (discount.minimum_purchase > 0 && subtotal < discount.minimum_purchase) {
      return false;
    }

    // Check minimum quantity
    if (discount.minimum_quantity > 0) {
      const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty < discount.minimum_quantity) {
        return false;
      }
    }

    // Check applies_to
    if (discount.applies_to === 'customers' && customerId) {
      const customerIds = this.parseJsonField(discount.applies_to_ids);
      return customerIds.includes(customerId);
    }

    return true;
  }

  private filterApplicableItems(discount: Discount, cartItems: CartItem[]): CartItem[] {
    if (discount.applies_to === 'all_products') {
      return cartItems;
    }

    if (discount.applies_to === 'specific_products') {
      const productIds = this.parseJsonField(discount.applies_to_ids);
      return cartItems.filter(item => productIds.includes(item.product_id));
    }

    if (discount.applies_to === 'categories') {
      const categoryIds = this.parseJsonField(discount.applies_to_ids);
      return cartItems.filter(item => item.category_id && categoryIds.includes(item.category_id));
    }

    return cartItems;
  }

  private parseJsonField(field: any): any[] {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  }

  private validateDiscountData(data: Partial<Discount>): void {
    if (data.discount_type) {
      const validTypes = ['percentage', 'fixed_amount', 'buy_x_get_y', 'bulk_discount'];
      if (!validTypes.includes(data.discount_type)) {
        throw new BadRequestException('Invalid discount type');
      }
    }

    if (data.discount_type === 'percentage' && data.discount_value) {
      if (data.discount_value < 0 || data.discount_value > 100) {
        throw new BadRequestException('Percentage must be between 0 and 100');
      }
    }

    if (data.discount_type === 'buy_x_get_y') {
      if (!data.buy_quantity || !data.get_quantity) {
        throw new BadRequestException('Buy X Get Y requires buy_quantity and get_quantity');
      }
    }
  }

  async getUsageStats(businessId: string, id: string) {
    const discount = await this.findOne(businessId, id);

    return {
      discount_id: discount.id,
      name: discount.name,
      current_uses: discount.current_uses,
      maximum_uses: discount.maximum_uses,
      remaining_uses: discount.maximum_uses
        ? discount.maximum_uses - discount.current_uses
        : null,
      is_active: discount.is_active,
      valid_from: discount.valid_from,
      valid_until: discount.valid_until,
    };
  }

  async incrementUsage(businessId: string, discountId: string): Promise<void> {
    const discount = await this.findOne(businessId, discountId);
    discount.current_uses += 1;
    await this.discountRepository.save(discount);
  }
}
