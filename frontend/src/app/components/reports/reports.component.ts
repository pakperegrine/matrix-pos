import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SalesSummary {
  current_period: {
    total_revenue: number;
    total_invoices: number;
    total_items_sold: number;
    total_discount: number;
    avg_order_value: number;
    start_date: string;
    end_date: string;
  };
  previous_period: {
    total_revenue: number;
    total_invoices: number;
    total_items_sold: number;
    total_discount: number;
  };
  growth: {
    revenue_growth: number;
    invoices_growth: number;
    items_growth: number;
  };
}

interface SalesByPeriod {
  group_by: string;
  data: Array<{
    period: string;
    invoice_count: number;
    total_revenue: number;
    total_discount: number;
    avg_order_value: number;
  }>;
}

interface ProductPerformance {
  top_products: Array<{
    rank: number;
    product_id: string;
    product_name: string;
    category: string;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
    avg_price: number;
  }>;
}

interface ProfitAnalysis {
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  profit_margin: number;
  start_date: string;
  end_date: string;
}

interface CustomerInsights {
  total_customers: number;
  active_customers: number;
  repeat_customers: number;
  customer_retention_rate: number;
  avg_customer_value: number;
}

interface PaymentMethodStats {
  payment_methods: Array<{
    payment_method: string;
    transaction_count: number;
    total_amount: number;
    avg_amount: number;
    percentage: number;
  }>;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  activeTab: string = 'overview';
  
  // Date filters
  startDate: string = '';
  endDate: string = '';
  datePreset: string = 'month';
  
  // Data
  salesSummary: SalesSummary | null = null;
  salesByPeriod: SalesByPeriod | null = null;
  productPerformance: ProductPerformance | null = null;
  profitAnalysis: ProfitAnalysis | null = null;
  customerInsights: CustomerInsights | null = null;
  paymentMethodStats: PaymentMethodStats | null = null;
  
  // Chart data
  chartType: string = 'day';
  
  // Loading states
  loadingSummary: boolean = false;
  loadingChart: boolean = false;
  loadingProducts: boolean = false;
  loadingProfit: boolean = false;
  loadingCustomers: boolean = false;
  loadingPayments: boolean = false;
  
  // Export
  exportingReport: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.setDatePreset('month');
    this.loadAllReports();
  }

  setDatePreset(preset: string) {
    this.datePreset = preset;
    const now = new Date();
    let start: Date, end: Date;

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = now;
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = now;
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }

    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];
    
    this.loadAllReports();
  }

  loadAllReports() {
    this.loadSalesSummary();
    this.loadSalesByPeriod();
    this.loadProductPerformance();
    this.loadProfitAnalysis();
    this.loadCustomerInsights();
    this.loadPaymentMethodStats();
  }

  loadSalesSummary() {
    this.loadingSummary = true;
    const params = new URLSearchParams({
      start_date: this.startDate,
      end_date: this.endDate,
    });

    this.http.get<SalesSummary>(`${environment.apiUrl}/reports/sales-summary?${params}`)
      .subscribe({
        next: (data) => {
          this.salesSummary = data;
          this.loadingSummary = false;
        },
        error: (err) => {
          console.error('Error loading sales summary:', err);
          this.loadingSummary = false;
        }
      });
  }

  loadSalesByPeriod() {
    this.loadingChart = true;
    const params = new URLSearchParams({
      start_date: this.startDate,
      end_date: this.endDate,
      group_by: this.chartType,
    });

    this.http.get<SalesByPeriod>(`${environment.apiUrl}/reports/sales-by-period?${params}`)
      .subscribe({
        next: (data) => {
          this.salesByPeriod = data;
          this.loadingChart = false;
        },
        error: (err) => {
          console.error('Error loading sales by period:', err);
          this.loadingChart = false;
        }
      });
  }

  loadProductPerformance() {
    this.loadingProducts = true;
    const params = new URLSearchParams({
      start_date: this.startDate,
      end_date: this.endDate,
      limit: '10',
    });

    this.http.get<ProductPerformance>(`${environment.apiUrl}/reports/product-performance?${params}`)
      .subscribe({
        next: (data) => {
          this.productPerformance = data;
          this.loadingProducts = false;
        },
        error: (err) => {
          console.error('Error loading product performance:', err);
          this.loadingProducts = false;
        }
      });
  }

  loadProfitAnalysis() {
    this.loadingProfit = true;
    const params = new URLSearchParams({
      start_date: this.startDate,
      end_date: this.endDate,
    });

    this.http.get<ProfitAnalysis>(`${environment.apiUrl}/reports/profit-analysis?${params}`)
      .subscribe({
        next: (data) => {
          this.profitAnalysis = data;
          this.loadingProfit = false;
        },
        error: (err) => {
          console.error('Error loading profit analysis:', err);
          this.loadingProfit = false;
        }
      });
  }

  loadCustomerInsights() {
    this.loadingCustomers = true;
    const params = new URLSearchParams({
      start_date: this.startDate,
      end_date: this.endDate,
    });

    this.http.get<CustomerInsights>(`${environment.apiUrl}/reports/customer-insights?${params}`)
      .subscribe({
        next: (data) => {
          this.customerInsights = data;
          this.loadingCustomers = false;
        },
        error: (err) => {
          console.error('Error loading customer insights:', err);
          this.loadingCustomers = false;
        }
      });
  }

  loadPaymentMethodStats() {
    this.loadingPayments = true;
    const params = new URLSearchParams({
      start_date: this.startDate,
      end_date: this.endDate,
    });

    this.http.get<PaymentMethodStats>(`${environment.apiUrl}/reports/payment-methods?${params}`)
      .subscribe({
        next: (data) => {
          this.paymentMethodStats = data;
          this.loadingPayments = false;
        },
        error: (err) => {
          console.error('Error loading payment methods:', err);
          this.loadingPayments = false;
        }
      });
  }

  onChartTypeChange() {
    this.loadSalesByPeriod();
  }

  onDateChange() {
    this.datePreset = 'custom';
    this.loadAllReports();
  }

  exportReport(reportType: string, format: string) {
    this.exportingReport = true;
    
    this.http.post<any>(`${environment.apiUrl}/reports/export`, {
      report_type: reportType,
      format: format,
      start_date: this.startDate,
      end_date: this.endDate,
    }).subscribe({
      next: (response) => {
        console.log('Export successful:', response);
        // In production, this would trigger a file download
        alert(`Report exported successfully! Download URL: ${response.download_url}`);
        this.exportingReport = false;
      },
      error: (err) => {
        console.error('Error exporting report:', err);
        alert('Failed to export report. Please try again.');
        this.exportingReport = false;
      }
    });
  }

  getGrowthClass(value: number): string {
    if (value > 0) return 'growth-positive';
    if (value < 0) return 'growth-negative';
    return 'growth-neutral';
  }

  getGrowthIcon(value: number): string {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getMaxRevenue(data: any[]): number {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.total_revenue));
  }

  formatPeriodLabel(period: string): string {
    // Truncate long period labels for display
    if (period.length > 10) {
      return period.substring(5); // Show month-day for dates
    }
    return period;
  }
}
