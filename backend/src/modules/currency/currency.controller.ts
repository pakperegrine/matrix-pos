import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  private getBusinessId(req: any): string {
    return req.user?.business_id || 'default-business-id';
  }

  @Get()
  async getAllCurrencies(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.currencyService.findAll(businessId);
  }

  @Get('active')
  async getActiveCurrencies(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.currencyService.findActive(businessId);
  }

  @Get('base')
  async getBaseCurrency(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.currencyService.findBaseCurrency(businessId);
  }

  @Post()
  async createCurrency(@Req() req: any, @Body() data: any) {
    const businessId = this.getBusinessId(req);
    return this.currencyService.create(businessId, data);
  }

  @Put(':id')
  async updateCurrency(@Param('id') id: string, @Body() data: any) {
    return this.currencyService.update(id, data);
  }

  @Delete(':id')
  async deleteCurrency(@Param('id') id: string) {
    return this.currencyService.delete(id);
  }

  @Post('refresh-rates')
  async refreshExchangeRates(@Req() req: any) {
    const businessId = this.getBusinessId(req);
    return this.currencyService.refreshExchangeRates(businessId);
  }

  @Post('convert')
  async convertCurrency(
    @Req() req: any,
    @Body('amount') amount: number,
    @Body('from_currency') fromCurrency: string,
    @Body('to_currency') toCurrency: string,
  ) {
    const businessId = this.getBusinessId(req);
    return this.currencyService.convert(businessId, amount, fromCurrency, toCurrency);
  }

  @Post('set-base')
  async setBaseCurrency(@Req() req: any, @Body('currency_id') currencyId: string) {
    const businessId = this.getBusinessId(req);
    return this.currencyService.setBaseCurrency(businessId, currencyId);
  }
}
