import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForecastingController } from './forecasting.controller';
import { ForecastingService } from './forecasting.service';
import { StockForecast } from '../../entities/stock-forecast.entity';
import { Product } from '../../entities/product.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { StockBatch } from '../../entities/stock-batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockForecast, Product, SaleItem, SaleInvoice, StockBatch])],
  controllers: [ForecastingController],
  providers: [ForecastingService],
  exports: [ForecastingService],
})
export class ForecastingModule {}
