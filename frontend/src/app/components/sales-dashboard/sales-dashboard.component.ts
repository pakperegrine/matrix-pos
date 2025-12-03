import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

interface SalesSummary {
  todaySales: number;
  todayProfit: number;
  todayTransactions: number;
  monthSales: number;
  monthProfit: number;
  monthTransactions: number;
}

interface SalesChartData {
  labels: string[];
  sales: number[];
  profit: number[];
}

interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_sales: number;
  total_profit: number;
}

interface RecentTransaction {
  id: string;
  invoice_no: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  item_count: number;
}

@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.scss']
})
export class SalesDashboardComponent implements OnInit {
  private apiUrl = 'http://localhost:3000/api';
  
  loading: boolean = false;
  period: 'today' | 'week' | 'month' = 'today';
  
  summary: SalesSummary = {
    todaySales: 0,
    todayProfit: 0,
    todayTransactions: 0,
    monthSales: 0,
    monthProfit: 0,
    monthTransactions: 0
  };
  
  chartData: SalesChartData = {
    labels: [],
    sales: [],
    profit: []
  };
  
  topProducts: TopProduct[] = [];
  recentTransactions: RecentTransaction[] = [];

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  private getHeaders() {
    const businessId = localStorage.getItem('businessId') || 'default_business';
    return {
      headers: {
        'x-business-id': businessId
      },
      params: {
        businessId: businessId
      }
    };
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadSummary(),
        this.loadChartData(),
        this.loadTopProducts(),
        this.loadRecentTransactions()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      this.toastService.error('Failed to load dashboard data', 'Error');
    } finally {
      this.loading = false;
    }
  }

  async loadSummary(): Promise<void> {
    try {
      // For now, we'll calculate from transactions since backend doesn't have summary endpoint
      const invoices = await this.http.get<any[]>(`${this.apiUrl}/sales`, this.getHeaders()).toPromise() || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      let todaySales = 0, todayProfit = 0, todayTransactions = 0;
      let monthSales = 0, monthProfit = 0, monthTransactions = 0;
      
      invoices.forEach(inv => {
        const invDate = new Date(inv.created_at);
        const sales = inv.total || 0;
        const profit = inv.total_profit || 0;
        
        if (invDate >= monthStart) {
          monthSales += sales;
          monthProfit += profit;
          monthTransactions++;
          
          if (invDate >= today) {
            todaySales += sales;
            todayProfit += profit;
            todayTransactions++;
          }
        }
      });
      
      this.summary = {
        todaySales,
        todayProfit,
        todayTransactions,
        monthSales,
        monthProfit,
        monthTransactions
      };
    } catch (error) {
      console.error('Failed to load summary', error);
    }
  }

  async loadChartData(): Promise<void> {
    try {
      const invoices = await this.http.get<any[]>(`${this.apiUrl}/sales`, this.getHeaders()).toPromise() || [];
      
      // Generate labels based on period
      const labels: string[] = [];
      const salesMap = new Map<string, number>();
      const profitMap = new Map<string, number>();
      
      if (this.period === 'today') {
        // Last 24 hours by hour
        for (let i = 23; i >= 0; i--) {
          const hour = new Date();
          hour.setHours(hour.getHours() - i, 0, 0, 0);
          const label = hour.getHours().toString().padStart(2, '0') + ':00';
          labels.push(label);
          salesMap.set(label, 0);
          profitMap.set(label, 0);
        }
      } else if (this.period === 'week') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          const label = day.toLocaleDateString('en-US', { weekday: 'short' });
          labels.push(label);
          salesMap.set(label, 0);
          profitMap.set(label, 0);
        }
      } else {
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          const label = day.getDate().toString();
          labels.push(label);
          salesMap.set(label, 0);
          profitMap.set(label, 0);
        }
      }
      
      // Aggregate data
      invoices.forEach(inv => {
        const invDate = new Date(inv.created_at);
        let label = '';
        
        if (this.period === 'today') {
          label = invDate.getHours().toString().padStart(2, '0') + ':00';
        } else if (this.period === 'week') {
          label = invDate.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          label = invDate.getDate().toString();
        }
        
        if (salesMap.has(label)) {
          salesMap.set(label, (salesMap.get(label) || 0) + (inv.total || 0));
          profitMap.set(label, (profitMap.get(label) || 0) + (inv.total_profit || 0));
        }
      });
      
      this.chartData = {
        labels,
        sales: labels.map(l => salesMap.get(l) || 0),
        profit: labels.map(l => profitMap.get(l) || 0)
      };
    } catch (error) {
      console.error('Failed to load chart data', error);
    }
  }

  async loadTopProducts(): Promise<void> {
    try {
      // We'll need to aggregate from sale items
      const items = await this.http.get<any[]>(`${this.apiUrl}/sales`, this.getHeaders()).toPromise() || [];
      
      const productMap = new Map<string, TopProduct>();
      
      // For simplicity, this is a placeholder - actual implementation would join with sale_items
      this.topProducts = [
        { product_name: 'Sample Product 1', total_quantity: 50, total_sales: 500, total_profit: 150 },
        { product_name: 'Sample Product 2', total_quantity: 30, total_sales: 300, total_profit: 90 },
        { product_name: 'Sample Product 3', total_quantity: 20, total_sales: 200, total_profit: 60 }
      ];
    } catch (error) {
      console.error('Failed to load top products', error);
    }
  }

  async loadRecentTransactions(): Promise<void> {
    try {
      const invoices = await this.http.get<any[]>(`${this.apiUrl}/sales`, this.getHeaders()).toPromise() || [];
      
      this.recentTransactions = invoices
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(inv => ({
          id: inv.id,
          invoice_no: inv.invoice_no || 'INV-' + inv.id.substring(0, 8),
          total_amount: inv.total || 0,
          payment_method: inv.payment_method || 'cash',
          created_at: inv.created_at,
          item_count: 0 // Would need to join with sale_items
        }));
    } catch (error) {
      console.error('Failed to load recent transactions', error);
    }
  }

  changePeriod(period: 'today' | 'week' | 'month'): void {
    this.period = period;
    this.loadChartData();
  }

  exportReport(): void {
    this.toastService.info('Export feature coming soon');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPolylinePoints(data: number[], width: number, height: number, padding: number): string {
    if (!data || data.length === 0) return '';
    
    const maxValue = Math.max(...data, 1);
    const xStep = (width - padding * 2) / (data.length - 1 || 1);
    
    return data.map((value, index) => {
      const x = padding + index * xStep;
      const y = height - (value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  }
}
