import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { StockForecast } from '../../entities/stock-forecast.entity';
import { Product } from '../../entities/product.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { StockBatch } from '../../entities/stock-batch.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ForecastingService {
  constructor(
    @InjectRepository(StockForecast)
    private forecastRepository: Repository<StockForecast>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(SaleInvoice)
    private saleInvoiceRepository: Repository<SaleInvoice>,
    @InjectRepository(StockBatch)
    private stockBatchRepository: Repository<StockBatch>,
  ) {}

  async getAllForecasts(businessId: string, daysThreshold?: number) {
    const query = this.forecastRepository
      .createQueryBuilder('forecast')
      .leftJoinAndSelect('forecast.product', 'product')
      .where('forecast.business_id = :businessId', { businessId })
      .orderBy('forecast.days_until_stockout', 'ASC');

    if (daysThreshold) {
      query.andWhere('forecast.days_until_stockout <= :threshold', { threshold: daysThreshold });
    }

    return query.getMany();
  }

  async getProductForecast(businessId: string, productId: string) {
    return this.forecastRepository.findOne({
      where: { business_id: businessId, product_id: productId },
    });
  }

  async getLowStockAlerts(businessId: string, daysThreshold: number = 7) {
    return this.forecastRepository.find({
      where: {
        business_id: businessId,
        days_until_stockout: LessThan(daysThreshold),
      },
      order: { days_until_stockout: 'ASC' },
    });
  }

  async getReorderSuggestions(businessId: string) {
    const forecasts = await this.forecastRepository
      .createQueryBuilder('forecast')
      .where('forecast.business_id = :businessId', { businessId })
      .andWhere('forecast.current_stock <= forecast.reorder_point')
      .orderBy('forecast.days_until_stockout', 'ASC')
      .getMany();

    return forecasts.map(f => ({
      product_id: f.product_id,
      current_stock: f.current_stock,
      reorder_point: f.reorder_point,
      suggested_order_qty: f.suggested_order_qty,
      days_until_stockout: f.days_until_stockout,
      urgency: f.days_until_stockout <= 3 ? 'critical' : f.days_until_stockout <= 7 ? 'high' : 'medium',
    }));
  }

  async getTrendAnalysis(businessId: string) {
    const forecasts = await this.forecastRepository.find({
      where: { business_id: businessId },
    });

    const trends = {
      increasing: forecasts.filter(f => f.trend === 'increasing').length,
      decreasing: forecasts.filter(f => f.trend === 'decreasing').length,
      stable: forecasts.filter(f => f.trend === 'stable').length,
      seasonal: forecasts.filter(f => f.is_seasonal).length,
    };

    return {
      trends,
      total_products: forecasts.length,
      avg_confidence: forecasts.reduce((sum, f) => sum + parseFloat(f.forecast_confidence as any || 0), 0) / forecasts.length,
    };
  }

  async getSeasonalProducts(businessId: string) {
    return this.forecastRepository.find({
      where: { business_id: businessId, is_seasonal: true },
      order: { avg_daily_sales: 'DESC' },
    });
  }

  async calculateProductForecast(businessId: string, productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId, business_id: businessId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get sales data for the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const salesData = await this.saleItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .where('item.product_id = :productId', { productId })
      .andWhere('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :startDate', { startDate: ninetyDaysAgo.toISOString() })
      .select([
        'SUM(item.quantity) as total_quantity',
        'COUNT(DISTINCT DATE(invoice.created_at)) as days_with_sales',
      ])
      .getRawOne();

    const totalQuantity = parseFloat(salesData?.total_quantity || 0);
    const daysWithSales = parseInt(salesData?.days_with_sales || 1);
    const avgDailySales = totalQuantity / 90; // Average over 90 days

    // Calculate trend (compare last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recent30 = await this.saleItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .where('item.product_id = :productId', { productId })
      .andWhere('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :startDate', { startDate: thirtyDaysAgo.toISOString() })
      .select('SUM(item.quantity) as total')
      .getRawOne();

    const previous30 = await this.saleItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.invoice', 'invoice')
      .where('item.product_id = :productId', { productId })
      .andWhere('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :startDate', { startDate: sixtyDaysAgo.toISOString() })
      .andWhere('invoice.created_at < :endDate', { endDate: thirtyDaysAgo.toISOString() })
      .select('SUM(item.quantity) as total')
      .getRawOne();

    const recentSales = parseFloat(recent30?.total || 0);
    const previousSales = parseFloat(previous30?.total || 0);
    
    let trend = 'stable';
    if (recentSales > previousSales * 1.2) trend = 'increasing';
    else if (recentSales < previousSales * 0.8) trend = 'decreasing';

    // Detect seasonality (simple variance check)
    const isSeasonalIndicator = daysWithSales > 0 && (daysWithSales / 90) < 0.3; // Sales only on < 30% of days

    // Calculate predictions
    const trendMultiplier = trend === 'increasing' ? 1.2 : trend === 'decreasing' ? 0.8 : 1;
    const predicted7d = avgDailySales * 7 * trendMultiplier;
    const predicted30d = avgDailySales * 30 * trendMultiplier;

    // Reorder calculations
    const leadTimeDays = 7; // Assume 7 days lead time
    const safetyStock = avgDailySales * 3; // 3 days safety stock
    const reorderPoint = (avgDailySales * leadTimeDays) + safetyStock;
    
    // Get current stock from stock batches
    const stockBatches = await this.stockBatchRepository.find({
      where: { product_id: productId },
    });
    const currentStock = stockBatches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
    
    const suggestedOrderQty = Math.max(0, reorderPoint + predicted30d - currentStock);

    // Days until stockout
    const daysUntilStockout = avgDailySales > 0 ? Math.floor(currentStock / avgDailySales) : 999;

    // Confidence (based on data availability)
    const confidence = Math.min(100, (daysWithSales / 90) * 100);

    // Save or update forecast
    const existingForecast = await this.forecastRepository.findOne({
      where: { business_id: businessId, product_id: productId },
    });

    const forecastData = {
      business_id: businessId,
      product_id: productId,
      current_stock: currentStock,
      avg_daily_sales: avgDailySales,
      predicted_demand_7d: predicted7d,
      predicted_demand_30d: predicted30d,
      reorder_point: reorderPoint,
      suggested_order_qty: suggestedOrderQty,
      days_until_stockout: daysUntilStockout,
      trend,
      is_seasonal: isSeasonalIndicator,
      forecast_confidence: confidence,
      calculated_at: new Date(),
    };

    if (existingForecast) {
      await this.forecastRepository.update({ id: existingForecast.id }, forecastData);
      return this.forecastRepository.findOne({ where: { id: existingForecast.id } });
    } else {
      const forecast = this.forecastRepository.create({
        id: uuidv4(),
        ...forecastData,
        created_at: new Date(),
      });
      return this.forecastRepository.save(forecast);
    }
  }

  async calculateAllForecasts(businessId: string) {
    const products = await this.productRepository.find({
      where: { business_id: businessId },
    });

    const results = [];
    for (const product of products) {
      try {
        const forecast = await this.calculateProductForecast(businessId, product.id);
        results.push({ product_id: product.id, status: 'success', forecast });
      } catch (error) {
        results.push({ product_id: product.id, status: 'error', error: error.message });
      }
    }

    return {
      message: 'Forecast calculation completed',
      total_products: products.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results,
    };
  }
}
