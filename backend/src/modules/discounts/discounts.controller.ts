import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { Discount } from '../../entities/discount.entity';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  private getBusinessId(req: any): string {
    return req.businessId || req.user?.business_id || 'default-business-id';
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('is_active') is_active?: string,
    @Query('discount_type') discount_type?: string,
    @Query('location_id') locationId?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.findAll(businessId, {
      is_active: is_active ? parseInt(is_active) : undefined,
      discount_type,
      location_id: locationId,
    });
  }

  @Get('active')
  async findActive(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.findActiveDiscounts(businessId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.findOne(businessId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() discountData: Partial<Discount>) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.create(businessId, discountData);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() discountData: Partial<Discount>,
  ) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.update(businessId, id, discountData);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.delete(businessId, id);
  }

  @Post('validate-code')
  async validateCode(
    @Req() req: any,
    @Body('code') code: string,
    @Body('cart_total') cart_total: number,
    @Body('customer_id') customer_id?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.validateCouponCode(
      businessId,
      code,
      cart_total,
      customer_id,
    );
  }

  @Post('calculate')
  async calculateDiscounts(
    @Req() req: any,
    @Body('cart_items') cart_items: any[],
    @Body('customer_id') customer_id?: string,
    @Body('coupon_codes') coupon_codes?: string[],
  ) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.calculateDiscounts(
      businessId,
      cart_items,
      customer_id,
      coupon_codes,
    );
  }

  @Get(':id/usage-stats')
  async getUsageStats(@Req() req: any, @Param('id') id: string) {
    const businessId = this.getBusinessId(req);
    return this.discountsService.getUsageStats(businessId, id);
  }
}
