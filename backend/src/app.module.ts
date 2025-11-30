import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { Product } from './entities/product.entity';
import { StockBatch } from './entities/stock-batch.entity';
import { SaleInvoice } from './entities/sale-invoice.entity';
import { SaleItem } from './entities/sale-item.entity';
import { User } from './entities/user.entity';
import { Business } from './entities/business.entity';
import { Customer } from './entities/customer.entity';
import { Discount } from './entities/discount.entity';
import { Currency } from './entities/currency.entity';
import { StockForecast } from './entities/stock-forecast.entity';
import { Settings } from './entities/settings.entity';
import { ProductsModule } from './modules/products/products.module';
import { StockBatchesModule } from './modules/stock-batches/stock-batches.module';
import { SyncModule } from './modules/sync/sync.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { ForecastingModule } from './modules/forecasting/forecasting.module';
import { SalesModule } from './modules/sales/sales.module';
import { SettingsModule } from './modules/settings/settings.module';
import { JwtTenantMiddleware } from './middleware/jwt-tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const type = process.env.DB_TYPE || 'sqlite';
        if (type === 'sqlite') {
          return {
            type: 'sqlite',
            database: process.env.DB_DATABASE || './dev.sqlite',
            synchronize: true,
            entities: [User, Business, Product, StockBatch, SaleInvoice, SaleItem, Customer, Discount, Currency, StockForecast, Settings]
          } as any;
        }
        return {
          type: 'mysql',
          host: process.env.DB_HOST || '127.0.0.1',
          port: Number(process.env.DB_PORT) || 3306,
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_DATABASE || 'matrix_pos',
          synchronize: false,
          entities: [User, Business, Product, StockBatch, SaleInvoice, SaleItem, Customer, Discount, Currency, StockForecast, Settings]
          } as any;
      }
    }),
    ProductsModule,
    StockBatchesModule,
    SyncModule,
    AuthModule,
    CustomersModule,
    DiscountsModule,
    ReportsModule,
    CurrencyModule,
    ForecastingModule,
    SalesModule,
    SettingsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtTenantMiddleware).forRoutes('*');
  }
}
