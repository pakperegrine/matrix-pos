import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockBatch } from '../../entities/stock-batch.entity';

@Injectable()
export class StockBatchesService {
  constructor(@InjectRepository(StockBatch) private repo: Repository<StockBatch>) {}

  async findAll(businessId: string, productId?: string, locationId?: string) {
    const where: any = { business_id: businessId };
    if (productId) where.product_id = productId;
    if (locationId) where.location_id = locationId;
    return this.repo.find({ where, order: { created_at: 'ASC' } });
  }

  async findAllForProduct(productId: string) {
    return this.repo.find({ where: { product_id: productId }, order: { created_at: 'ASC' } });
  }

  async create(batch: Partial<StockBatch>) {
    const b = this.repo.create(batch as any);
    return this.repo.save(b as any);
  }
}
