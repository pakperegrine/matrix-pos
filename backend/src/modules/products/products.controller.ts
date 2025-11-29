import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  async list(@Req() req: any) {
    const businessId = req.businessId;
    return this.svc.findAll(businessId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const businessId = req.businessId;
    if (!businessId) throw new Error('Missing business_id in token');
    return this.svc.create(businessId, body);
  }
}
