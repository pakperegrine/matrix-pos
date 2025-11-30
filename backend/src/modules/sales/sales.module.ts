import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { SaleItem } from '../../entities/sale-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SaleInvoice, SaleItem])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
