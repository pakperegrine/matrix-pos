import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { SaleItem } from '../../entities/sale-item.entity';
import { StockBatch } from '../../entities/stock-batch.entity';
import { FifoService } from './fifo.service';
import { v4 as uuidv4 } from 'uuid';

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

  /**
   * Generates a unique invoice number in format: INV-YYYYMMDDHHMMSS-XXXX
   * where XXXX is a random 4-character alphanumeric suffix
   */
  private generateInvoiceNumber(): string {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '')
      .substring(0, 14); // YYYYMMDDHHMMSS
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  async ingestOfflineSale(businessId: string | undefined, userId: string | null, payload: OfflineSaleDto) {
    try {
      // Check idempotency: if temp_invoice_no already exists, return existing invoice
      if (payload.temp_invoice_no) {
        const existing = await this.invoices.findOne({
          where: { business_id: businessId, invoice_no: payload.temp_invoice_no } as any
        });
        if (existing) return { ok: true, invoice_id: existing.id, duplicate: true };
      }

      // Generate invoice number if not provided
      const invoiceNo = payload.temp_invoice_no || this.generateInvoiceNumber();

      const subtotal = payload.items.reduce((s, i) => s + (Number(i.sale_price) * Number(i.quantity)), 0);
      
      const invoice: Partial<SaleInvoice> = {
        id: uuidv4(),
        business_id: businessId,
        location_id: payload.location_id || null,
        subtotal: subtotal,
        total: subtotal,
        source: payload.source || 'offline',
        invoice_no: invoiceNo,
        created_by: userId,
        created_at: new Date()
      };
      await this.invoices.insert(invoice as any);

      let totalCost = 0;
      for (const it of payload.items) {
        // Calculate FIFO cost
        const fifoResult = await this.fifo.calculateFifoCost(
          it.product_id,
          payload.location_id || null,
          Number(it.quantity)
        );

        const itemCost = fifoResult.total_cost;
        totalCost += itemCost;

        const saleItem: Partial<SaleItem> = {
          id: uuidv4(),
          invoice_id: invoice.id as string,
          product_id: it.product_id,
          quantity: Number(it.quantity),
          sale_price: Number(it.sale_price),
          fifo_cost: Number(fifoResult.fifo_cost),
          total_cost: Number(itemCost),
          profit: (Number(it.sale_price) * Number(it.quantity)) - Number(itemCost)
        };
        await this.items.insert(saleItem as any);
      }

      // Update invoice totals
      await this.invoices.update(invoice.id as string, {
        total_cost: Number(totalCost),
        total_profit: Number(invoice.total || 0) - Number(totalCost)
      } as any);

      return { ok: true, invoice_id: invoice.id };
    } catch (error) {
      console.error('Error in ingestOfflineSale:', error);
      throw error;
    }
  }
}
