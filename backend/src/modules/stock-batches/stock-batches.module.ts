import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockBatch } from '../../entities/stock-batch.entity';
import { StockBatchesService } from './stock-batches.service';
import { StockBatchesController } from './stock-batches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockBatch])],
  controllers: [StockBatchesController],
  providers: [StockBatchesService]
})
export class StockBatchesModule {}
