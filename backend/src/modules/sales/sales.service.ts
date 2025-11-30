import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { SaleItem } from '../../entities/sale-item.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SaleInvoice)
    private invoiceRepo: Repository<SaleInvoice>,
    @InjectRepository(SaleItem)
    private itemRepo: Repository<SaleItem>,
  ) {}

  async findAll(businessId: string): Promise<SaleInvoice[]> {
    return this.invoiceRepo.find({
      where: { business_id: businessId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, businessId: string): Promise<SaleInvoice | null> {
    return this.invoiceRepo.findOne({
      where: { id, business_id: businessId },
    });
  }

  async create(data: any): Promise<SaleInvoice> {
    const invoice = this.invoiceRepo.create(data);
    const saved: SaleInvoice | SaleInvoice[] = await this.invoiceRepo.save(invoice);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(id: string, data: any): Promise<SaleInvoice> {
    await this.invoiceRepo.update(id, data);
    return this.invoiceRepo.findOne({ where: { id } }) as Promise<SaleInvoice>;
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this.invoiceRepo.delete({ id, business_id: businessId });
  }
}
