import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async findAll(businessId?: string) {
    if (businessId) return this.repo.find({ where: { business_id: businessId } });
    return this.repo.find();
  }

  async create(businessId: string, data: Partial<Product>) {
    const p = this.repo.create({ ...data, business_id: businessId } as any);
    return this.repo.save(p as any);
  }
}
