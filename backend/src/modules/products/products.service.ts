import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async findAll(businessId?: string) {
    if (businessId) return this.repo.find({ where: { business_id: businessId } });
    return this.repo.find();
  }

  async findOne(id: string, businessId: string) {
    const product = await this.repo.findOne({ where: { id, business_id: businessId } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(businessId: string, data: Partial<Product>) {
    const p = this.repo.create({ 
      ...data, 
      id: uuid(),
      business_id: businessId 
    } as any);
    return this.repo.save(p as any);
  }

  async update(id: string, businessId: string, data: Partial<Product>) {
    await this.findOne(id, businessId); // Verify exists and belongs to business
    await this.repo.update({ id, business_id: businessId }, data);
    return this.findOne(id, businessId);
  }

  async remove(id: string, businessId: string) {
    const product = await this.findOne(id, businessId); // Verify exists and belongs to business
    await this.repo.delete({ id, business_id: businessId });
    return { deleted: true, product };
  }
}
