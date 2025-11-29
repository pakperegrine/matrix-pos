import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import { StockBatch } from '../../entities/stock-batch.entity';
import { FifoService } from './fifo.service';

interface OfflineSaleItemDto {
  product_id: string;
  quantity: number;
  sale_price: number;
}

interface OfflineSaleDto {
  source: 'offline' | 'online';
  business_id?: string;
  location_id?: string;
  temp_invoice_no?: string;
  items: OfflineSaleItemDto[];
}

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SaleInvoice) private invoices: Repository<SaleInvoice>,
    @InjectRepository(SaleItem) private items: Repository<SaleItem>,
    @InjectRepository(StockBatch) private batches: Repository<StockBatch>,
    private fifo: FifoService
  ) {}

  async ingestOfflineSale(businessId: string | undefined, payload: OfflineSaleDto) {
    // Check idempotency: if temp_invoice_no already exists, return existing invoice
    if (payload.temp_invoice_no) {
      const existing = await this.invoices.findOne({
        where: { business_id: businessId, invoice_no: payload.temp_invoice_no } as any
      });
      if (existing) return { ok: true, invoice_id: existing.id, duplicate: true };
    }

    const invoice: Partial<SaleInvoice> = {
      id: crypto.randomUUID(),
      business_id: businessId,
      location_id: payload.location_id,
      subtotal: payload.items.reduce((s, i) => s + i.sale_price * i.quantity, 0),
      total: payload.items.reduce((s, i) => s + i.sale_price * i.quantity, 0),
      source: payload.source || 'offline',
      invoice_no: payload.temp_invoice_no,
      created_at: new Date()
    };
    await this.invoices.insert(invoice as any);

    let totalCost = 0;
    for (const it of payload.items) {
      // Calculate FIFO cost
      const fifoResult = await this.fifo.calculateFifoCost(
        it.product_id,
        payload.location_id || '',
        it.quantity
      );

      const itemCost = fifoResult.total_cost;
      totalCost += itemCost;

      const saleItem: Partial<SaleItem> = {
        id: crypto.randomUUID(),
        invoice_id: invoice.id as string,
        product_id: it.product_id,
        quantity: it.quantity,
        sale_price: it.sale_price,
        fifo_cost: fifoResult.fifo_cost,
        total_cost: itemCost,
        profit: it.sale_price * it.quantity - itemCost
      };
      await this.items.insert(saleItem as any);
    }

    // Update invoice totals
    await this.invoices.update(invoice.id as string, {
      total_cost: totalCost,
      total_profit: (invoice.total || 0) - totalCost
    } as any);

    return { ok: true, invoice_id: invoice.id };
  }
}
