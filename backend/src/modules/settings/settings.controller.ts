import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Settings } from '../../entities/settings.entity';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findByBusiness(@Query('businessId') businessId: string): Promise<Settings> {
    return this.settingsService.findByBusiness(businessId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Settings> {
    return this.settingsService.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Settings>): Promise<Settings> {
    return this.settingsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Settings>,
  ): Promise<Settings> {
    return this.settingsService.update(id, data);
  }

  @Post('reset')
  async resetToDefaults(@Body('businessId') businessId: string): Promise<Settings> {
    return this.settingsService.resetToDefaults(businessId);
  }
}