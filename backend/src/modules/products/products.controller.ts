import { Controller, Get, Post, Put, Delete, Body, Req, Param, UnauthorizedException } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  async list(@Req() req: any) {
    const businessId = req.businessId;
    return this.svc.findAll(businessId);
  }

  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.svc.findOne(id, businessId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.svc.create(businessId, body);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.svc.update(id, businessId, body);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.svc.remove(id, businessId);
  }
}
