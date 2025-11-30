import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../../entities/settings.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async findByBusiness(businessId: string): Promise<Settings> {
    let settings = await this.settingsRepository.findOne({
      where: { business_id: businessId },
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await this.createDefaults(businessId);
    }

    return settings;
  }

  async findOne(id: string): Promise<Settings> {
    const settings = await this.settingsRepository.findOne({ where: { id } });
    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }
    return settings;
  }

  async create(data: Partial<Settings>): Promise<Settings> {
    const settings = this.settingsRepository.create({
      id: uuidv4(),
      ...data,
    });
    return this.settingsRepository.save(settings);
  }

  async update(id: string, data: Partial<Settings>): Promise<Settings> {
    await this.settingsRepository.update(id, data);
    return this.findOne(id);
  }

  async resetToDefaults(businessId: string): Promise<Settings> {
    // Delete existing settings
    await this.settingsRepository.delete({ business_id: businessId });
    // Create new default settings
    return this.createDefaults(businessId);
  }

  private async createDefaults(businessId: string): Promise<Settings> {
    const defaults = this.settingsRepository.create({
      id: uuidv4(),
      business_id: businessId,
      business_name: 'My Business',
      tax_enabled: 0,
      tax_rate: 0,
      tax_type: 'inclusive',
      tax_label: 'Tax',
      receipt_header: 'Thank you for your purchase!',
      receipt_footer: 'Please come again!',
      show_receipt_logo: 1,
      auto_print_receipt: 1,
      receipt_format: 'thermal',
      receipt_width: 80,
      show_tax_on_receipt: 1,
      show_business_info_on_receipt: 1,
      default_currency: 'USD',
      currency_symbol: '$',
      currency_position: 'before',
      decimal_places: 2,
      decimal_separator: '.',
      thousand_separator: ',',
      allow_negative_stock: 0,
      track_stock_batches: 1,
      low_stock_threshold: 10,
      show_low_stock_alerts: 1,
      invoice_prefix: 'INV',
      invoice_start_number: 1,
      invoice_number_padding: 5,
      enable_discounts: 1,
      enable_customer_selection: 1,
      enable_barcode_scanner: 1,
      require_customer_for_sale: 0,
      products_per_page: 20,
      enable_offline_mode: 1,
      offline_sync_interval: 30,
      max_offline_transactions: 100,
      enable_email_notifications: 1,
      enable_low_stock_notifications: 1,
      enable_daily_sales_report: 1,
      timezone: 'America/New_York',
      date_format: 'MM/DD/YYYY',
      time_format: 'hh:mm A',
      language: 'en',
      session_timeout: 30,
      enable_sound_effects: 1,
      enable_animations: 1,
    });

    return this.settingsRepository.save(defaults);
  }
}