import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Settings } from '../models/settings';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'http://localhost:3000/api/settings';
  private settingsSubject = new BehaviorSubject<Settings | null>(null);
  public settings$ = this.settingsSubject.asObservable();
  
  // Business ID from localStorage (should come from auth service in production)
  private businessId = 'business-1';

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {
    this.loadSettings();
    
    // Reload settings when location changes
    this.locationService.selectedLocation$.subscribe(() => {
      this.loadSettings();
    });
  }

  loadSettings(): void {
    // Get current location ID
    const locationId = localStorage.getItem('selectedLocationId');
    let url = `${this.apiUrl}?businessId=${this.businessId}`;
    
    if (locationId) {
      url += `&location_id=${locationId}`;
    }
    
    this.http.get<Settings>(url)
      .pipe(
        tap(settings => this.settingsSubject.next(settings))
      )
      .subscribe({
        error: (error) => console.error('Error loading settings:', error)
      });
  }

  getSettings(): Settings | null {
    return this.settingsSubject.value;
  }

  updateSettings(settings: Settings): Observable<Settings> {
    return this.http.put<Settings>(`${this.apiUrl}/${settings.id}`, settings)
      .pipe(
        tap(updated => this.settingsSubject.next(updated))
      );
  }

  // Helper methods for common settings
  isDiscountsEnabled(): boolean {
    return this.settingsSubject.value?.enable_discounts === 1;
  }

  isCustomerSelectionEnabled(): boolean {
    return this.settingsSubject.value?.enable_customer_selection === 1;
  }

  isBarcodeScannerEnabled(): boolean {
    return this.settingsSubject.value?.enable_barcode_scanner === 1;
  }

  isCustomerRequired(): boolean {
    return this.settingsSubject.value?.require_customer_for_sale === 1;
  }

  isTaxEnabled(): boolean {
    return this.settingsSubject.value?.tax_enabled === 1;
  }

  getTaxRate(): number {
    return this.settingsSubject.value?.tax_rate || 0;
  }

  getTaxType(): string {
    return this.settingsSubject.value?.tax_type || 'inclusive';
  }

  getTaxLabel(): string {
    return this.settingsSubject.value?.tax_label || 'Tax';
  }

  getReceiptHeader(): string {
    return this.settingsSubject.value?.receipt_header || '';
  }

  getReceiptFooter(): string {
    return this.settingsSubject.value?.receipt_footer || '';
  }

  showBusinessInfoOnReceipt(): boolean {
    return this.settingsSubject.value?.show_business_info_on_receipt === 1;
  }

  showTaxOnReceipt(): boolean {
    return this.settingsSubject.value?.show_tax_on_receipt === 1;
  }

  getBusinessName(): string {
    return this.settingsSubject.value?.business_name || 'My Business';
  }

  getBusinessAddress(): string {
    return this.settingsSubject.value?.business_address || '';
  }

  getBusinessPhone(): string {
    return this.settingsSubject.value?.business_phone || '';
  }

  getCurrencySymbol(): string {
    return this.settingsSubject.value?.currency_symbol || '$';
  }

  getCurrencyPosition(): string {
    return this.settingsSubject.value?.currency_position || 'before';
  }

  getDecimalPlaces(): number {
    return this.settingsSubject.value?.decimal_places || 2;
  }

  formatCurrency(amount: number | string | null | undefined): string {
    // Convert to number and handle edge cases
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
    
    // If still not a valid number, return default
    if (isNaN(numAmount)) {
      return '$0.00';
    }
    
    const settings = this.settingsSubject.value;
    if (!settings) return `$${numAmount.toFixed(2)}`;

    const fixed = numAmount.toFixed(settings.decimal_places);
    const [whole, decimal] = fixed.split('.');
    
    // Add thousand separator
    const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousand_separator);
    
    // Combine with decimal
    const numberStr = decimal ? `${formatted}${settings.decimal_separator}${decimal}` : formatted;
    
    // Add currency symbol
    return settings.currency_position === 'before'
      ? `${settings.currency_symbol}${numberStr}`
      : `${numberStr}${settings.currency_symbol}`;
  }

  calculateTax(subtotal: number): number {
    if (!this.isTaxEnabled()) return 0;
    
    const taxRate = this.getTaxRate() / 100;
    const taxType = this.getTaxType();

    if (taxType === 'inclusive') {
      // Tax is already included in price
      // Tax = Subtotal - (Subtotal / (1 + rate))
      return subtotal - (subtotal / (1 + taxRate));
    } else {
      // Tax is added to price
      return subtotal * taxRate;
    }
  }

  getSubtotalBeforeTax(total: number): number {
    if (!this.isTaxEnabled()) return total;
    
    const taxRate = this.getTaxRate() / 100;
    const taxType = this.getTaxType();

    if (taxType === 'inclusive') {
      // Remove tax from total
      return total / (1 + taxRate);
    } else {
      // Total already is before tax
      return total;
    }
  }
}
