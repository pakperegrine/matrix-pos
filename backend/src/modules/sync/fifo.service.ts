import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockBatch } from '../../entities/stock-batch.entity';

export interface FifoCostResult {
  fifo_cost: number;
  total_cost: number;
  batches_used: Array<{ batch_id: string; qty: number }>;
}

@Injectable()
export class FifoService {
  constructor(@InjectRepository(StockBatch) private batches: Repository<StockBatch>) {}

  async calculateFifoCost(productId: string, locationId: string | null, qty: number): Promise<FifoCostResult> {
    const whereCondition: any = { product_id: productId };
    if (locationId) {
      whereCondition.location_id = locationId;
    }
    
    const batches = await this.batches.find({
      where: whereCondition,
      order: { created_at: 'ASC' }
    });

    let remaining = Number(qty) || 0;
    let totalCost = 0;
    const used: Array<{ batch_id: string; qty: number }> = [];

    for (const batch of batches) {
      if (remaining <= 0) break;
      const available = Number(batch.quantity) || 0;
      if (available <= 0) continue;

      const take = Math.min(available, remaining);
      const costPrice = Number(batch.cost_price) || 0;
      totalCost += take * costPrice;
      used.push({ batch_id: batch.id, qty: take });
      remaining -= take;

      // Update batch quantity
      batch.quantity = available - take;
      await this.batches.save(batch as any);
    }

    const fifo_cost = qty > 0 ? totalCost / qty : 0;
    return { fifo_cost, total_cost: totalCost, batches_used: used };
  }
}
