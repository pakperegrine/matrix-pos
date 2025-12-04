import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LocationService } from '../../services/location.service';
import { Subscription } from 'rxjs';

interface Forecast {
  id: string;
  product_id: string;
  current_stock: number;
  avg_daily_sales: number;
  predicted_demand_7d: number;
  predicted_demand_30d: number;
  reorder_point: number;
  suggested_order_qty: number;
  days_until_stockout: number;
  trend: string;
  is_seasonal: boolean;
  forecast_confidence: number;
  calculated_at: string;
}

interface ReorderSuggestion {
  product_id: string;
  current_stock: number;
  reorder_point: number;
  suggested_order_qty: number;
  days_until_stockout: number;
  urgency: string;
}

@Component({
  selector: 'app-inventory-forecasting',
  templateUrl: './inventory-forecasting.component.html',
  styleUrls: ['./inventory-forecasting.component.scss']
})
export class InventoryForecastingComponent implements OnInit, OnDestroy {
  activeTab: string = 'overview';
  
  // Location filtering
  selectedLocationId: string | null = null;
  private locationSubscription?: Subscription;
  
  // Data
  forecasts: Forecast[] = [];
  reorderSuggestions: ReorderSuggestion[] = [];
  lowStockAlerts: Forecast[] = [];
  seasonalProducts: Forecast[] = [];
  trendAnalysis: any = null;
  
  // Filters
  filterDays: number = 30;
  filterTrend: string = 'all';
  
  // Loading states
  loading: boolean = false;
  calculating: boolean = false;
  
  // Products map (for display names)
  productsMap: Map<string, any> = new Map();

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    // Subscribe to location changes
    this.locationSubscription = this.locationService.selectedLocation$.subscribe(location => {
      this.selectedLocationId = location?.id || null;
      this.loadAllData();
    });
    
    this.loadProducts();
    this.loadAllData();
  }
  
  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }

  loadProducts() {
    const params: any = {};
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    
    this.http.get<any[]>(`${environment.apiUrl}/products`, { params })
      .subscribe({
        next: (products) => {
          products.forEach(p => this.productsMap.set(p.id, p));
        },
        error: (err) => console.error('Error loading products:', err)
      });
  }

  loadAllData() {
    this.loadForecasts();
    this.loadReorderSuggestions();
    this.loadLowStockAlerts();
    this.loadSeasonalProducts();
    this.loadTrendAnalysis();
  }

  loadForecasts() {
    this.loading = true;
    const params: any = {};
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    
    this.http.get<Forecast[]>(`${environment.apiUrl}/forecasting/products`, { params })
      .subscribe({
        next: (data) => {
          this.forecasts = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading forecasts:', err);
          this.loading = false;
        }
      });
  }

  loadReorderSuggestions() {
    const params: any = {};
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    
    this.http.get<ReorderSuggestion[]>(`${environment.apiUrl}/forecasting/reorder-suggestions`, { params })
      .subscribe({
        next: (data) => {
          this.reorderSuggestions = data;
        },
        error: (err) => console.error('Error loading reorder suggestions:', err)
      });
  }

  loadLowStockAlerts() {
    const params: any = { days: this.filterDays };
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    
    this.http.get<Forecast[]>(`${environment.apiUrl}/forecasting/low-stock`, { params })
      .subscribe({
        next: (data) => {
          this.lowStockAlerts = data;
        },
        error: (err) => console.error('Error loading low stock alerts:', err)
      });
  }

  loadSeasonalProducts() {
    const params: any = {};
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    
    this.http.get<Forecast[]>(`${environment.apiUrl}/forecasting/seasonal`, { params })
      .subscribe({
        next: (data) => {
          this.seasonalProducts = data;
        },
        error: (err) => console.error('Error loading seasonal products:', err)
      });
  }

  loadTrendAnalysis() {
    const params: any = {};
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    
    this.http.get<any>(`${environment.apiUrl}/forecasting/trends`, { params })
      .subscribe({
        next: (data) => {
          this.trendAnalysis = data;
        },
        error: (err) => console.error('Error loading trend analysis:', err)
      });
  }

  calculateForecasts() {
    if (!confirm('Recalculate all forecasts? This may take a few moments.')) return;
    
    this.calculating = true;
    this.http.post(`${environment.apiUrl}/forecasting/calculate`, {})
      .subscribe({
        next: (result: any) => {
          alert(`Forecast calculation completed!\nSuccessful: ${result.successful}\nFailed: ${result.failed}`);
          this.calculating = false;
          this.loadAllData();
        },
        error: (err) => {
          console.error('Error calculating forecasts:', err);
          alert('Failed to calculate forecasts');
          this.calculating = false;
        }
      });
  }

  getProductName(productId: string): string {
    return this.productsMap.get(productId)?.name || 'Unknown Product';
  }

  getFilteredForecasts(): Forecast[] {
    let filtered = [...this.forecasts];
    
    if (this.filterTrend !== 'all') {
      filtered = filtered.filter(f => f.trend === this.filterTrend);
    }
    
    return filtered.sort((a, b) => a.days_until_stockout - b.days_until_stockout);
  }

  getIncreasingForecasts(): Forecast[] {
    return this.forecasts.filter(f => f.trend === 'increasing').slice(0, 10);
  }

  getDecreasingForecasts(): Forecast[] {
    return this.forecasts.filter(f => f.trend === 'decreasing').slice(0, 10);
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'increasing': return 'trend-up';
      case 'decreasing': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return '';
    }
  }

  getUrgencyClass(urgency: string): string {
    switch (urgency) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      default: return 'urgency-low';
    }
  }

  getStockoutClass(days: number): string {
    if (days <= 3) return 'stockout-critical';
    if (days <= 7) return 'stockout-warning';
    if (days <= 14) return 'stockout-caution';
    return 'stockout-ok';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
