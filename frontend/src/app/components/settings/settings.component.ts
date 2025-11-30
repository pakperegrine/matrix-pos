import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../../models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings: Settings | null = null;
  loading = false;
  saving = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  activeTab: string = 'business';

  // Business ID from localStorage (should come from auth service in production)
  businessId = 'business-1';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.http.get<Settings>(`http://localhost:3000/api/settings?businessId=${this.businessId}`)
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading settings:', error);
          this.showMessage('Failed to load settings', 'error');
          this.loading = false;
        }
      });
  }

  saveSettings(): void {
    if (!this.settings) return;

    this.saving = true;
    const endpoint = this.settings.id
      ? `http://localhost:3000/api/settings/${this.settings.id}`
      : 'http://localhost:3000/api/settings';

    const method = this.settings.id ? 'put' : 'post';

    this.http.request<Settings>(method, endpoint, { body: this.settings })
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.saving = false;
          this.showMessage('Settings saved successfully!', 'success');
        },
        error: (error) => {
          console.error('Error saving settings:', error);
          this.showMessage('Failed to save settings', 'error');
          this.saving = false;
        }
      });
  }

  resetToDefaults(): void {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    this.loading = true;
    this.http.post<Settings>('http://localhost:3000/api/settings/reset', { businessId: this.businessId })
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.loading = false;
          this.showMessage('Settings reset to defaults', 'success');
        },
        error: (error) => {
          console.error('Error resetting settings:', error);
          this.showMessage('Failed to reset settings', 'error');
          this.loading = false;
        }
      });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 3000);
  }

  // Helper methods for template
  get taxEnabled(): boolean {
    return this.settings?.tax_enabled === 1;
  }

  set taxEnabled(value: boolean) {
    if (this.settings) {
      this.settings.tax_enabled = value ? 1 : 0;
    }
  }

  get showReceiptLogo(): boolean {
    return this.settings?.show_receipt_logo === 1;
  }

  set showReceiptLogo(value: boolean) {
    if (this.settings) {
      this.settings.show_receipt_logo = value ? 1 : 0;
    }
  }

  get autoPrintReceipt(): boolean {
    return this.settings?.auto_print_receipt === 1;
  }

  set autoPrintReceipt(value: boolean) {
    if (this.settings) {
      this.settings.auto_print_receipt = value ? 1 : 0;
    }
  }

  get showTaxOnReceipt(): boolean {
    return this.settings?.show_tax_on_receipt === 1;
  }

  set showTaxOnReceipt(value: boolean) {
    if (this.settings) {
      this.settings.show_tax_on_receipt = value ? 1 : 0;
    }
  }

  get showBusinessInfoOnReceipt(): boolean {
    return this.settings?.show_business_info_on_receipt === 1;
  }

  set showBusinessInfoOnReceipt(value: boolean) {
    if (this.settings) {
      this.settings.show_business_info_on_receipt = value ? 1 : 0;
    }
  }

  get allowNegativeStock(): boolean {
    return this.settings?.allow_negative_stock === 1;
  }

  set allowNegativeStock(value: boolean) {
    if (this.settings) {
      this.settings.allow_negative_stock = value ? 1 : 0;
    }
  }

  get trackStockBatches(): boolean {
    return this.settings?.track_stock_batches === 1;
  }

  set trackStockBatches(value: boolean) {
    if (this.settings) {
      this.settings.track_stock_batches = value ? 1 : 0;
    }
  }

  get showLowStockAlerts(): boolean {
    return this.settings?.show_low_stock_alerts === 1;
  }

  set showLowStockAlerts(value: boolean) {
    if (this.settings) {
      this.settings.show_low_stock_alerts = value ? 1 : 0;
    }
  }

  get enableDiscounts(): boolean {
    return this.settings?.enable_discounts === 1;
  }

  set enableDiscounts(value: boolean) {
    if (this.settings) {
      this.settings.enable_discounts = value ? 1 : 0;
    }
  }

  get enableCustomerSelection(): boolean {
    return this.settings?.enable_customer_selection === 1;
  }

  set enableCustomerSelection(value: boolean) {
    if (this.settings) {
      this.settings.enable_customer_selection = value ? 1 : 0;
    }
  }

  get enableBarcodeScanner(): boolean {
    return this.settings?.enable_barcode_scanner === 1;
  }

  set enableBarcodeScanner(value: boolean) {
    if (this.settings) {
      this.settings.enable_barcode_scanner = value ? 1 : 0;
    }
  }

  get requireCustomerForSale(): boolean {
    return this.settings?.require_customer_for_sale === 1;
  }

  set requireCustomerForSale(value: boolean) {
    if (this.settings) {
      this.settings.require_customer_for_sale = value ? 1 : 0;
    }
  }

  get enableOfflineMode(): boolean {
    return this.settings?.enable_offline_mode === 1;
  }

  set enableOfflineMode(value: boolean) {
    if (this.settings) {
      this.settings.enable_offline_mode = value ? 1 : 0;
    }
  }

  get enableEmailNotifications(): boolean {
    return this.settings?.enable_email_notifications === 1;
  }

  set enableEmailNotifications(value: boolean) {
    if (this.settings) {
      this.settings.enable_email_notifications = value ? 1 : 0;
    }
  }

  get enableLowStockNotifications(): boolean {
    return this.settings?.enable_low_stock_notifications === 1;
  }

  set enableLowStockNotifications(value: boolean) {
    if (this.settings) {
      this.settings.enable_low_stock_notifications = value ? 1 : 0;
    }
  }

  get enableDailySalesReport(): boolean {
    return this.settings?.enable_daily_sales_report === 1;
  }

  set enableDailySalesReport(value: boolean) {
    if (this.settings) {
      this.settings.enable_daily_sales_report = value ? 1 : 0;
    }
  }

  get enableSoundEffects(): boolean {
    return this.settings?.enable_sound_effects === 1;
  }

  set enableSoundEffects(value: boolean) {
    if (this.settings) {
      this.settings.enable_sound_effects = value ? 1 : 0;
    }
  }

  get enableAnimations(): boolean {
    return this.settings?.enable_animations === 1;
  }

  set enableAnimations(value: boolean) {
    if (this.settings) {
      this.settings.enable_animations = value ? 1 : 0;
    }
  }
}
