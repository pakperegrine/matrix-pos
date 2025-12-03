import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import { Product } from '../../entities/product.entity';
import { Customer } from '../../entities/customer.entity';

interface DateRange {
  start_date?: string;
  end_date?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(SaleInvoice)
    private saleInvoiceRepository: Repository<SaleInvoice>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async getSalesSummary(
    businessId: string,
    options: DateRange & { period?: string },
  ) {
    const { start_date, end_date } = this.getDateRange(options);

    const query = this.saleInvoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.business_id = :businessId', { businessId });

    if (start_date) {
      query.andWhere('invoice.created_at >= :start_date', { start_date });
    }
    if (end_date) {
      query.andWhere('invoice.created_at <= :end_date', { end_date });
    }

    const [invoices, totalInvoices] = await query.getManyAndCount();

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total as any),
      0,
    );
    const totalDiscount = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.discount_amount as any || 0),
      0,
    );
    const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // Get total items sold
    const itemsQuery = this.saleItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .where('invoice.business_id = :businessId', { businessId });

    if (start_date) {
      itemsQuery.andWhere('invoice.created_at >= :start_date', { start_date });
    }
    if (end_date) {
      itemsQuery.andWhere('invoice.created_at <= :end_date', { end_date });
    }

    const items = await itemsQuery.getMany();
    const totalItemsSold = items.reduce((sum, item) => sum + item.quantity, 0);

    // Get previous period for comparison
    const previousPeriod = await this.getPreviousPeriodData(
      businessId,
      start_date,
      end_date,
    );

    return {
      current_period: {
        total_revenue: totalRevenue,
        total_invoices: totalInvoices,
        total_items_sold: totalItemsSold,
        total_discount: totalDiscount,
        avg_order_value: avgOrderValue,
        start_date,
        end_date,
      },
      previous_period: previousPeriod,
      growth: {
        revenue_growth: this.calculateGrowth(
          totalRevenue,
          previousPeriod.total_revenue,
        ),
        invoices_growth: this.calculateGrowth(
          totalInvoices,
          previousPeriod.total_invoices,
        ),
        items_growth: this.calculateGrowth(
          totalItemsSold,
          previousPeriod.total_items_sold,
        ),
      },
    };
  }

  async getSalesByPeriod(
    businessId: string,
    options: DateRange & { group_by: string },
  ) {
    const { start_date, end_date, group_by } = options;

    let dateFormat: string;
    switch (group_by) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%W';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const query = this.saleInvoiceRepository
      .createQueryBuilder('invoice')
      .select([
        `strftime('${dateFormat}', invoice.created_at) as period`,
        'COUNT(*) as invoice_count',
        'SUM(invoice.total) as total_revenue',
        'SUM(invoice.discount_amount) as total_discount',
        'AVG(invoice.total) as avg_order_value',
      ])
      .where('invoice.business_id = :businessId', { businessId })
      .groupBy('period')
      .orderBy('period', 'ASC');

    if (start_date) {
      query.andWhere('invoice.created_at >= :start_date', { start_date });
    }
    if (end_date) {
      query.andWhere('invoice.created_at <= :end_date', { end_date });
    }

    const results = await query.getRawMany();

    return {
      group_by,
      data: results.map((r) => ({
        period: r.period,
        invoice_count: parseInt(r.invoice_count),
        total_revenue: parseFloat(r.total_revenue || 0),
        total_discount: parseFloat(r.total_discount || 0),
        avg_order_value: parseFloat(r.avg_order_value || 0),
      })),
    };
  }

  async getProductPerformance(
    businessId: string,
    options: DateRange & { limit: number },
  ) {
    const { start_date, end_date, limit } = options;

    const query = this.saleItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .leftJoin('item.product', 'product')
      .select([
        'product.id as product_id',
        'product.name as product_name',
        'product.category_id as category',
        'SUM(item.quantity) as total_quantity',
        'SUM(item.sale_price * item.quantity) as total_revenue',
        'COUNT(DISTINCT invoice.id) as order_count',
        'AVG(item.sale_price) as avg_price',
      ])
      .where('invoice.business_id = :businessId', { businessId })
      .andWhere('product.id IS NOT NULL')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.category_id')
      .orderBy('total_revenue', 'DESC')
      .limit(limit);

    if (start_date) {
      query.andWhere('invoice.created_at >= :start_date', { start_date });
    }
    if (end_date) {
      query.andWhere('invoice.created_at <= :end_date', { end_date });
    }

    const results = await query.getRawMany();

    return {
      top_products: results.map((r, index) => ({
        rank: index + 1,
        product_id: r.product_id,
        product_name: r.product_name,
        category: r.category,
        total_quantity: parseInt(r.total_quantity),
        total_revenue: parseFloat(r.total_revenue),
        order_count: parseInt(r.order_count),
        avg_price: parseFloat(r.avg_price),
      })),
    };
  }

  async getProfitAnalysis(businessId: string, options: DateRange) {
    const { start_date, end_date } = this.getDateRange(options);

    const query = this.saleItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .leftJoin('item.product', 'product')
      .where('invoice.business_id = :businessId', { businessId });

    if (start_date) {
      query.andWhere('invoice.created_at >= :start_date', { start_date });
    }
    if (end_date) {
      query.andWhere('invoice.created_at <= :end_date', { end_date });
    }

    const items = await query.getMany();

    let totalRevenue = 0;
    let totalCost = 0;

    for (const item of items) {
      const revenue = parseFloat(item.sale_price as any) * item.quantity;
      const cost = parseFloat(item.fifo_cost as any || 0) * item.quantity;
      totalRevenue += revenue;
      totalCost += cost;
    }

    const grossProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      total_revenue: totalRevenue,
      total_cost: totalCost,
      gross_profit: grossProfit,
      profit_margin: profitMargin,
      start_date,
      end_date,
    };
  }

  async getCustomerInsights(businessId: string, options: DateRange) {
    const { start_date, end_date } = this.getDateRange(options);

    const query = this.saleInvoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .where('invoice.business_id = :businessId', { businessId });

    if (start_date) {
      query.andWhere('invoice.created_at >= :start_date', { start_date });
    }
    if (end_date) {
      query.andWhere('invoice.created_at <= :end_date', { end_date });
    }

    const invoices = await query.getMany();

    const totalCustomers = await this.customerRepository.count({
      where: { business_id: businessId },
    });

    const uniqueCustomers = new Set(
      invoices.map((inv) => inv.customer_id).filter(Boolean),
    ).size;

    const repeatCustomers = invoices.filter((inv) => {
      if (!inv.customer_id) return false;
      const customerInvoices = invoices.filter(
        (i) => i.customer_id === inv.customer_id,
      );
      return customerInvoices.length > 1;
    }).length;

    return {
      total_customers: totalCustomers,
      active_customers: uniqueCustomers,
      repeat_customers: repeatCustomers,
      customer_retention_rate:
        uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0,
      avg_customer_value:
        uniqueCustomers > 0
          ? invoices.reduce(
              (sum, inv) => sum + parseFloat(inv.total as any),
              0,
            ) / uniqueCustomers
          : 0,
    };
  }

  async getPaymentMethodStats(businessId: string, options: DateRange) {
    const { start_date, end_date } = this.getDateRange(options);

    const query = this.saleInvoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'invoice.payment_method as payment_method',
        'COUNT(*) as transaction_count',
        'SUM(invoice.total) as total_amount',
        'AVG(invoice.total) as avg_amount',
      ])
      .where('invoice.business_id = :businessId', { businessId })
      .groupBy('invoice.payment_method');

    if (start_date) {
      query.andWhere('invoice.created_at >= :start_date', { start_date });
    }
    if (end_date) {
      query.andWhere('invoice.created_at <= :end_date', { end_date });
    }

    const results = await query.getRawMany();

    const total = results.reduce(
      (sum, r) => sum + parseFloat(r.total_amount),
      0,
    );

    return {
      payment_methods: results.map((r) => ({
        payment_method: r.payment_method,
        transaction_count: parseInt(r.transaction_count),
        total_amount: parseFloat(r.total_amount),
        avg_amount: parseFloat(r.avg_amount),
        percentage: total > 0 ? (parseFloat(r.total_amount) / total) * 100 : 0,
      })),
    };
  }

  async getComparativeAnalysis(businessId: string, comparisonType: string) {
    const now = new Date();
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

    if (comparisonType === 'month') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (comparisonType === 'year') {
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = new Date(now.getFullYear(), 11, 31);
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31);
    } else {
      // week
      const day = now.getDay();
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - day);
      currentEnd = new Date(currentStart);
      currentEnd.setDate(currentStart.getDate() + 6);
      previousStart = new Date(currentStart);
      previousStart.setDate(currentStart.getDate() - 7);
      previousEnd = new Date(previousStart);
      previousEnd.setDate(previousStart.getDate() + 6);
    }

    const current = await this.getSalesSummary(businessId, {
      start_date: currentStart.toISOString(),
      end_date: currentEnd.toISOString(),
    });

    const previous = await this.getSalesSummary(businessId, {
      start_date: previousStart.toISOString(),
      end_date: previousEnd.toISOString(),
    });

    return {
      comparison_type: comparisonType,
      current: current.current_period,
      previous: previous.current_period,
      growth: {
        revenue_growth: this.calculateGrowth(
          current.current_period.total_revenue,
          previous.current_period.total_revenue,
        ),
        invoices_growth: this.calculateGrowth(
          current.current_period.total_invoices,
          previous.current_period.total_invoices,
        ),
        items_growth: this.calculateGrowth(
          current.current_period.total_items_sold,
          previous.current_period.total_items_sold,
        ),
      },
    };
  }

  async exportReport(
    businessId: string,
    options: {
      report_type: string;
      format: string;
      start_date?: string;
      end_date?: string;
    },
  ) {
    let data: any;

    switch (options.report_type) {
      case 'sales_summary':
        data = await this.getSalesSummary(businessId, options);
        break;
      case 'product_performance':
        data = await this.getProductPerformance(businessId, {
          ...options,
          limit: 50,
        });
        break;
      case 'profit_analysis':
        data = await this.getProfitAnalysis(businessId, options);
        break;
      case 'customer_insights':
        data = await this.getCustomerInsights(businessId, options);
        break;
      default:
        data = { error: 'Invalid report type' };
    }

    // For now, return JSON data. In production, this would generate CSV/PDF
    return {
      report_type: options.report_type,
      format: options.format,
      generated_at: new Date().toISOString(),
      data,
      download_url: `/exports/${options.report_type}_${Date.now()}.${options.format}`,
    };
  }

  private getDateRange(options: DateRange): {
    start_date?: string;
    end_date?: string;
  } {
    const now = new Date();
    const start_date =
      options.start_date ||
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end_date = options.end_date || now.toISOString();

    return { start_date, end_date };
  }

  private async getPreviousPeriodData(
    businessId: string,
    start_date?: string,
    end_date?: string,
  ) {
    if (!start_date || !end_date) {
      return {
        total_revenue: 0,
        total_invoices: 0,
        total_items_sold: 0,
        total_discount: 0,
      };
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const duration = end.getTime() - start.getTime();

    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(start.getTime() - 1);

    const query = this.saleInvoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :prevStart', {
        prevStart: prevStart.toISOString(),
      })
      .andWhere('invoice.created_at <= :prevEnd', {
        prevEnd: prevEnd.toISOString(),
      });

    const [invoices, totalInvoices] = await query.getManyAndCount();

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total as any),
      0,
    );
    const totalDiscount = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.discount_amount as any || 0),
      0,
    );

    // Get items for previous period
    const itemsQuery = this.saleItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .where('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :prevStart', {
        prevStart: prevStart.toISOString(),
      })
      .andWhere('invoice.created_at <= :prevEnd', {
        prevEnd: prevEnd.toISOString(),
      });

    const items = await itemsQuery.getMany();
    const totalItemsSold = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      total_revenue: totalRevenue,
      total_invoices: totalInvoices,
      total_items_sold: totalItemsSold,
      total_discount: totalDiscount,
    };
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}
