import { Controller, Get, Query, Req, Post, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private getBusinessId(req: any): string {
    return req.user?.business_id || 'default-business-id';
  }

  @Get('sales-summary')
  async getSalesSummary(
    @Req() req: any,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('period') period?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.getSalesSummary(businessId, {
      start_date,
      end_date,
      period,
    });
  }

  @Get('sales-by-period')
  async getSalesByPeriod(
    @Req() req: any,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('group_by') group_by?: string,
    @Query('location_id') location_id?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.getSalesByPeriod(businessId, {
      start_date,
      end_date,
      group_by: group_by || 'day',
      location_id,
    });
  }

  @Get('product-performance')
  async getProductPerformance(
    @Req() req: any,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('limit') limit?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.getProductPerformance(businessId, {
      start_date,
      end_date,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('profit-analysis')
  async getProfitAnalysis(
    @Req() req: any,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.getProfitAnalysis(businessId, {
      start_date,
      end_date,
    });
  }

  @Get('customer-insights')
  async getCustomerInsights(
    @Req() req: any,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.getCustomerInsights(businessId, {
      start_date,
      end_date,
    });
  }

  @Get('payment-methods')
  async getPaymentMethodStats(
    @Req() req: any,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.getPaymentMethodStats(businessId, {
      start_date,
      end_date,
    });
  }

  @Get('comparative-analysis')
  async getComparativeAnalysis(
    @Req() req: any,
    @Query('comparison_type') comparison_type?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.getComparativeAnalysis(
      businessId,
      comparison_type || 'month',
    );
  }

  @Post('export')
  async exportReport(
    @Req() req: any,
    @Body('report_type') report_type: string,
    @Body('format') format: string,
    @Body('start_date') start_date?: string,
    @Body('end_date') end_date?: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.reportsService.exportReport(businessId, {
      report_type,
      format,
      start_date,
      end_date,
    });
  }
}
