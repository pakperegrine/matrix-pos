import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../../entities/location.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async findAll(businessId: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { business_id: businessId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, businessId: string): Promise<Location> {
    return this.locationRepository.findOne({
      where: { id, business_id: businessId },
    });
  }

  async findActive(businessId: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { business_id: businessId, status: 'active' },
      order: { name: 'ASC' },
    });
  }

  async create(data: Partial<Location>, businessId: string): Promise<Location> {
    const location = this.locationRepository.create({
      id: uuid(),
      ...data,
      business_id: businessId,
      created_at: new Date(),
    });

    return this.locationRepository.save(location);
  }

  async update(
    id: string,
    data: Partial<Location>,
    businessId: string,
  ): Promise<Location> {
    await this.locationRepository.update(
      { id, business_id: businessId },
      { ...data, updated_at: new Date() },
    );

    return this.findOne(id, businessId);
  }

  async updateStatus(
    id: string,
    status: string,
    businessId: string,
  ): Promise<Location> {
    await this.locationRepository.update(
      { id, business_id: businessId },
      { status, updated_at: new Date() },
    );

    return this.findOne(id, businessId);
  }

  async delete(id: string, businessId: string): Promise<void> {
    // Soft delete by setting status to 'closed'
    await this.locationRepository.update(
      { id, business_id: businessId },
      { status: 'closed', updated_at: new Date() },
    );
  }

  async getStatistics(
    locationId: string,
    businessId: string,
  ): Promise<any> {
    // This will be implemented with joins to sale_invoices
    const location = await this.findOne(locationId, businessId);
    
    return {
      location,
      // Statistics will be added here
      total_sales: 0,
      total_transactions: 0,
      active_users: 0,
    };
  }
}
