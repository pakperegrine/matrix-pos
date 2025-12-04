import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll(@Request() req) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    return this.locationsService.findAll(businessId);
  }

  @Get('active')
  async findActive(@Request() req) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    return this.locationsService.findActive(businessId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    return this.locationsService.findOne(id, businessId);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string, @Request() req) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    return this.locationsService.getStatistics(id, businessId);
  }

  @Post()
  async create(@Body() data: any, @Request() req) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    return this.locationsService.create(data, businessId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    return this.locationsService.update(id, data, businessId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req,
  ) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    return this.locationsService.updateStatus(id, body.status, businessId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const businessId = req.businessId || req.user?.business_id || req.headers['x-business-id'];
    await this.locationsService.delete(id, businessId);
    return { message: 'Location closed successfully' };
  }
}
