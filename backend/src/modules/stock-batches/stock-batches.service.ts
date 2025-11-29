import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockBatch } from '../../entities/stock-batch.entity';

@Injectable()
export class StockBatchesService {
  constructor(@InjectRepository(StockBatch) private repo: Repository<StockBatch>) {}

  async findAllForProduct(productId: string) {
    return this.repo.find({ where: { product_id: productId }, order: { created_at: 'ASC' } });
  }

  async create(batch: Partial<StockBatch>) {
    const b = this.repo.create(batch as any);
    return this.repo.save(b as any);
  }
}
