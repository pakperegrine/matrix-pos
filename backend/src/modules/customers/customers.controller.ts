import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from '../../entities/customer.entity';

// Mock request with business_id for testing (replace with actual JWT auth later)
interface MockRequest {
  user: {
    business_id: string;
  };
}

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Helper to get business_id (replace with JWT extraction later)
  private getBusinessId(req: any): string {
    return req.businessId || req.user?.business_id || 'business-1';
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('customer_type') customer_type?: string,
    @Query('is_active') is_active?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('location_id') locationId?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.customersService.findAll(businessId, {
      search,
      customer_type,
      is_active: is_active ? parseInt(is_active) : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      location_id: locationId,
    });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const businessId = this.getBusinessId(req);
    return this.customersService.findOne(businessId, id);
  }

  @Get(':id/purchases')
  async getPurchaseHistory(
    @Req() req: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.customersService.getPurchaseHistory(businessId, id, limit ? parseInt(limit) : 10);
  }

  @Get(':id/statistics')
  async getStatistics(@Req() req: any, @Param('id') id: string) {
    const businessId = this.getBusinessId(req);
    return this.customersService.getStatistics(businessId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() customerData: Partial<Customer>) {
    const businessId = this.getBusinessId(req);
    return this.customersService.create(businessId, customerData);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() customerData: Partial<Customer>,
  ) {
    const businessId = this.getBusinessId(req);
    return this.customersService.update(businessId, id, customerData);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const businessId = this.getBusinessId(req);
    return this.customersService.delete(businessId, id);
  }

  @Post(':id/add-loyalty-points')
  async addLoyaltyPoints(
    @Req() req: any,
    @Param('id') id: string,
    @Body('points') points: number,
    @Body('reason') reason?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.customersService.addLoyaltyPoints(businessId, id, points, reason);
  }

  @Post(':id/redeem-points')
  async redeemPoints(
    @Req() req: any,
    @Param('id') id: string,
    @Body('points') points: number,
  ) {
    const businessId = this.getBusinessId(req);
    return this.customersService.redeemPoints(businessId, id, points);
  }
}
