import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import { Product } from '../../entities/product.entity';
import { Customer } from '../../entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SaleInvoice, SaleItem, Product, Customer]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
