import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UnauthorizedException } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll(@Req() req: any, @Query('location_id') locationId?: string) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.salesService.findAll(businessId, locationId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.salesService.findOne(id, businessId);
  }

  @Post()
  async create(@Req() req: any, @Body() data: any) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.salesService.create({ ...data, business_id: businessId });
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.salesService.update(id, businessId, data);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const businessId = req.businessId;
    if (!businessId) throw new UnauthorizedException('Missing business_id in token');
    return this.salesService.delete(id, businessId);
  }
}
