import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_base: boolean;
  is_active: boolean;
  rate_updated_at: string;
}

@Component({
  selector: 'app-currency-settings',
  standalone: false,
  templateUrl: './currency-settings.component.html',
  styleUrls: ['./currency-settings.component.scss']
})
export class CurrencySettingsComponent implements OnInit {
  currencies: Currency[] = [];
  baseCurrency: Currency | null = null;
  
  // Form
  showForm: boolean = false;
  editingCurrency: Currency | null = null;
  formData = {
    code: '',
    name: '',
    symbol: '',
    exchange_rate: 1,
    is_active: true
  };
  
  // Loading states
  loading: boolean = false;
  refreshing: boolean = false;
  saving: boolean = false;
  
  // Conversion calculator
  showCalculator: boolean = false;
  conversionFrom: string = '';
  conversionTo: string = '';
  conversionAmount: number = 1;
  conversionResult: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCurrencies();
  }

  loadCurrencies() {
    this.loading = true;
    this.http.get<Currency[]>(`${environment.apiUrl}/currency`)
      .subscribe({
        next: (data) => {
          this.currencies = data;
          this.baseCurrency = data.find(c => c.is_base) || null;
          if (this.currencies.length > 0 && !this.conversionFrom) {
            this.conversionFrom = this.baseCurrency?.code || this.currencies[0].code;
            this.conversionTo = this.currencies.find(c => !c.is_base)?.code || this.currencies[0].code;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading currencies:', err);
          this.loading = false;
        }
      });
  }

  openForm(currency?: Currency) {
    if (currency) {
      this.editingCurrency = currency;
      this.formData = {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        exchange_rate: currency.exchange_rate,
        is_active: currency.is_active
      };
    } else {
      this.editingCurrency = null;
      this.formData = {
        code: '',
        name: '',
        symbol: '',
        exchange_rate: 1,
        is_active: true
      };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingCurrency = null;
  }

  saveCurrency() {
    this.saving = true;
    const request = this.editingCurrency
      ? this.http.put(`${environment.apiUrl}/currency/${this.editingCurrency.id}`, this.formData)
      : this.http.post(`${environment.apiUrl}/currency`, this.formData);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.loadCurrencies();
      },
      error: (err) => {
        console.error('Error saving currency:', err);
        alert('Failed to save currency');
        this.saving = false;
      }
    });
  }

  deleteCurrency(id: string) {
    if (!confirm('Are you sure you want to delete this currency?')) return;
    
    this.http.delete(`${environment.apiUrl}/currency/${id}`)
      .subscribe({
        next: () => {
          this.loadCurrencies();
        },
        error: (err) => {
          console.error('Error deleting currency:', err);
          alert('Failed to delete currency: ' + (err.error?.message || 'Unknown error'));
        }
      });
  }

  setBaseCurrency(currencyId: string) {
    if (!confirm('Set this as the base currency? All exchange rates will be relative to this currency.')) return;
    
    this.http.post(`${environment.apiUrl}/currency/set-base`, { currency_id: currencyId })
      .subscribe({
        next: () => {
          this.loadCurrencies();
        },
        error: (err) => {
          console.error('Error setting base currency:', err);
          alert('Failed to set base currency');
        }
      });
  }

  refreshRates() {
    this.refreshing = true;
    this.http.post(`${environment.apiUrl}/currency/refresh-rates`, {})
      .subscribe({
        next: (result: any) => {
          alert(`Exchange rates refreshed! Updated ${result.updated_currencies.length} currencies.`);
          this.refreshing = false;
          this.loadCurrencies();
        },
        error: (err) => {
          console.error('Error refreshing rates:', err);
          alert('Failed to refresh exchange rates');
          this.refreshing = false;
        }
      });
  }

  toggleCalculator() {
    this.showCalculator = !this.showCalculator;
    if (this.showCalculator) {
      this.conversionResult = null;
    }
  }

  convertCurrency() {
    if (!this.conversionFrom || !this.conversionTo || this.conversionAmount <= 0) return;
    
    this.http.post(`${environment.apiUrl}/currency/convert`, {
      amount: this.conversionAmount,
      from_currency: this.conversionFrom,
      to_currency: this.conversionTo
    }).subscribe({
      next: (result) => {
        this.conversionResult = result;
      },
      error: (err) => {
        console.error('Error converting currency:', err);
        alert('Failed to convert currency');
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
