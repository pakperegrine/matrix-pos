import { Controller, Get, Post, Query, Body, Req, UnauthorizedException } from '@nestjs/common';
import { StockBatchesService } from './stock-batches.service';

@Controller('stock-batches')
export class StockBatchesController {
  constructor(private svc: StockBatchesService) {}

  @Get()
  async list(
    @Req() req: any,
    @Query('product_id') productId?: string,
    @Query('location_id') locationId?: string,
  ) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.svc.findAll(businessId, productId, locationId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.svc.create({ ...body, business_id: businessId });
  }
}
