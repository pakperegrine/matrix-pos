import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import { StockBatch } from '../../entities/stock-batch.entity';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';

import { FifoService } from './fifo.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleInvoice, SaleItem, StockBatch])],
  providers: [SyncService, FifoService],
  controllers: [SyncController]
})
export class SyncModule {}
