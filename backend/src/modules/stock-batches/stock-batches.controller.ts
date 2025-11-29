import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { StockBatchesService } from './stock-batches.service';

@Controller('stock-batches')
export class StockBatchesController {
  constructor(private svc: StockBatchesService) {}

  @Get()
  async list(@Query('product_id') productId: string) {
    if (!productId) return [];
    return this.svc.findAllForProduct(productId);
  }

  @Post()
  async create(@Body() body: any) {
    return this.svc.create(body);
  }
}
