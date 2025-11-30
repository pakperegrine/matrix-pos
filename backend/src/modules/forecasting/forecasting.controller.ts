import { Controller, Get, Post, Req, Query, Param } from '@nestjs/common';
import { ForecastingService } from './forecasting.service';

@Controller('forecasting')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  private getBusinessId(req: any): string {
    return req.user?.business_id || 'default-business-id';
  }

  @Get('products')
  async getAllForecasts(
    @Req() req: any,
    @Query('threshold') threshold?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.getAllForecasts(businessId, threshold ? parseInt(threshold) : undefined);
  }

  @Get('products/:productId')
  async getProductForecast(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.getProductForecast(businessId, productId);
  }

  @Get('low-stock')
  async getLowStockAlerts(
    @Req() req: any,
    @Query('days') days?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.getLowStockAlerts(businessId, days ? parseInt(days) : 7);
  }

  @Get('reorder-suggestions')
  async getReorderSuggestions(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.getReorderSuggestions(businessId);
  }

  @Get('trends')
  async getTrendAnalysis(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.getTrendAnalysis(businessId);
  }

  @Get('seasonal')
  async getSeasonalProducts(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.getSeasonalProducts(businessId);
  }

  @Post('calculate')
  async calculateForecasts(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.calculateAllForecasts(businessId);
  }

  @Post('calculate/:productId')
  async calculateProductForecast(
    @Req() req: any,
    @Param('productId') productId: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.forecastingService.calculateProductForecast(businessId, productId);
  }
}
