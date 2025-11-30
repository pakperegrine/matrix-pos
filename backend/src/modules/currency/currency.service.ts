import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../../entities/currency.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  async findAll(businessId: string) {
    return this.currencyRepository.find({
      where: { business_id: businessId },
      order: { is_base: 'DESC', code: 'ASC' },
    });
  }

  async findActive(businessId: string) {
    return this.currencyRepository.find({
      where: { business_id: businessId, is_active: true },
      order: { is_base: 'DESC', code: 'ASC' },
    });
  }

  async findBaseCurrency(businessId: string) {
    return this.currencyRepository.findOne({
      where: { business_id: businessId, is_base: true },
    });
  }

  async findByCode(businessId: string, code: string) {
    return this.currencyRepository.findOne({
      where: { business_id: businessId, code },
    });
  }

  async create(businessId: string, data: any) {
    const currency = this.currencyRepository.create({
      id: uuidv4(),
      business_id: businessId,
      code: data.code.toUpperCase(),
      name: data.name,
      symbol: data.symbol,
      exchange_rate: parseFloat(data.exchange_rate) || 1,
      is_base: data.is_base || false,
      is_active: data.is_active !== false,
      rate_updated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // If setting as base, unset other base currencies
    if (currency.is_base) {
      await this.currencyRepository.update(
        { business_id: businessId, is_base: true },
        { is_base: false },
      );
      currency.exchange_rate = 1;
    }

    return this.currencyRepository.save(currency);
  }

  async update(id: string, data: any) {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.symbol) updateData.symbol = data.symbol;
    if (data.exchange_rate !== undefined) {
      updateData.exchange_rate = parseFloat(data.exchange_rate);
      updateData.rate_updated_at = new Date();
    }
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    await this.currencyRepository.update(id, updateData);
    return this.currencyRepository.findOne({ where: { id } });
  }

  async delete(id: string) {
    const currency = await this.currencyRepository.findOne({ where: { id } });
    if (currency?.is_base) {
      throw new Error('Cannot delete base currency');
    }
    await this.currencyRepository.delete(id);
    return { message: 'Currency deleted successfully' };
  }

  async setBaseCurrency(businessId: string, currencyId: string) {
    // Unset all base currencies
    await this.currencyRepository.update(
      { business_id: businessId, is_base: true },
      { is_base: false },
    );

    // Set new base currency with rate = 1
    await this.currencyRepository.update(
      { id: currencyId },
      { is_base: true, exchange_rate: 1, rate_updated_at: new Date() },
    );

    return this.currencyRepository.findOne({ where: { id: currencyId } });
  }

  async convert(
    businessId: string,
    amount: number,
    fromCode: string,
    toCode: string,
  ) {
    const fromCurrency = await this.findByCode(businessId, fromCode);
    const toCurrency = await this.findByCode(businessId, toCode);

    if (!fromCurrency || !toCurrency) {
      throw new Error('Currency not found');
    }

    // Convert to base currency first, then to target currency
    const baseAmount = amount / parseFloat(fromCurrency.exchange_rate as any);
    const convertedAmount = baseAmount * parseFloat(toCurrency.exchange_rate as any);

    return {
      from_currency: fromCode,
      to_currency: toCode,
      from_amount: amount,
      to_amount: convertedAmount,
      exchange_rate: parseFloat(toCurrency.exchange_rate as any) / parseFloat(fromCurrency.exchange_rate as any),
      converted_at: new Date(),
    };
  }

  async refreshExchangeRates(businessId: string) {
    // In production, this would fetch from an external API like fixer.io, exchangerate-api.com
    // For now, we'll return a mock success response
    
    const currencies = await this.findAll(businessId);
    const baseCurrency = await this.findBaseCurrency(businessId);

    if (!baseCurrency) {
      throw new Error('No base currency set');
    }

    // Mock exchange rates (in production, fetch from API)
    const mockRates: { [key: string]: number } = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.50,
      CAD: 1.36,
      AUD: 1.53,
      CHF: 0.88,
      CNY: 7.24,
      INR: 83.12,
      MXN: 17.08,
    };

    const updated = [];
    for (const currency of currencies) {
      if (!currency.is_base && mockRates[currency.code]) {
        await this.currencyRepository.update(
          { id: currency.id },
          {
            exchange_rate: mockRates[currency.code],
            rate_updated_at: new Date(),
          },
        );
        updated.push(currency.code);
      }
    }

    return {
      message: 'Exchange rates refreshed successfully',
      updated_currencies: updated,
      base_currency: baseCurrency.code,
      updated_at: new Date(),
    };
  }

  async initializeDefaultCurrencies(businessId: string) {
    const existing = await this.findAll(businessId);
    if (existing.length > 0) {
      return { message: 'Currencies already initialized' };
    }

    const defaultCurrencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchange_rate: 1, is_base: true },
      { code: 'EUR', name: 'Euro', symbol: '€', exchange_rate: 0.92, is_base: false },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchange_rate: 0.79, is_base: false },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchange_rate: 149.50, is_base: false },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchange_rate: 1.36, is_base: false },
    ];

    for (const curr of defaultCurrencies) {
      await this.create(businessId, curr);
    }

    return {
      message: 'Default currencies initialized',
      count: defaultCurrencies.length,
    };
  }
}
