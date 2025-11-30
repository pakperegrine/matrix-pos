import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll(@Query('businessId') businessId: string) {
    return this.salesService.findAll(businessId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('businessId') businessId: string) {
    return this.salesService.findOne(id, businessId);
  }

  @Post()
  async create(@Body() data: any) {
    return this.salesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.salesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query('businessId') businessId: string) {
    return this.salesService.delete(id, businessId);
  }
}
