import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Business } from '../../entities/business.entity';
import { Location } from '../../entities/location.entity';
import { UserSession } from '../../entities/user-session.entity';
import { BusinessStatistic } from '../../entities/business-statistic.entity';
import { SaleInvoice } from '../../entities/sale-invoice.entity';
import { Product } from '../../entities/product.entity';
import { v4 as uuid } from 'uuid';
import * as argon2 from 'argon2';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    @InjectRepository(SaleInvoice)
    private saleRepository: Repository<SaleInvoice>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // User Management
  async findAllUsers(businessId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { business_id: businessId },
      order: { role: 'ASC', name: 'ASC' },
    });
  }

  async createUser(
    data: Partial<User>,
    businessId: string,
    createdBy: string,
  ): Promise<User> {
    const passwordHash = await argon2.hash(data.password_hash || 'password123');

    const user = this.userRepository.create({
      id: uuid(),
      ...data,
      business_id: businessId,
      password_hash: passwordHash,
      status: data.status || 'active',
      role: data.role || 'cashier',
      created_by: createdBy,
    });

    return this.userRepository.save(user);
  }

  async updateUser(
    userId: string,
    data: Partial<User>,
    businessId: string,
  ): Promise<User> {
    const updateData: any = { ...data };
    
    // Handle password separately
    if (data.password_hash) {
      updateData.password_hash = await argon2.hash(data.password_hash);
    } else {
      delete updateData.password_hash;
    }
    
    updateData.updated_at = new Date();

    await this.userRepository.update(
      { id: userId, business_id: businessId },
      updateData,
    );

    return this.userRepository.findOne({
      where: { id: userId, business_id: businessId },
    });
  }

  async updateUserStatus(
    userId: string,
    status: string,
    businessId: string,
  ): Promise<User> {
    await this.userRepository.update(
      { id: userId, business_id: businessId },
      { status, updated_at: new Date() },
    );

    return this.userRepository.findOne({
      where: { id: userId, business_id: businessId },
    });
  }

  async deleteUser(userId: string, businessId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId, business_id: businessId },
      { status: 'inactive', updated_at: new Date() },
    );
  }

  // Dashboard Statistics
  async getDashboardStats(
    businessId: string,
    locationId?: string,
  ): Promise<any> {
    const whereCondition: any = { business_id: businessId };
    if (locationId) {
      whereCondition.location_id = locationId;
    }

    // Get all locations
    const locations = await this.locationRepository.find({
      where: { business_id: businessId },
    });

    // Get active users count
    const activeUsers = await this.userRepository.count({
      where: { business_id: businessId, status: 'active' },
    });

    // Get total products
    const totalProducts = await this.productRepository.count({
      where: { business_id: businessId },
    });

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = await this.saleRepository
      .createQueryBuilder('invoice')
      .where('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :today', { today })
      .select('COUNT(*)', 'count')
      .addSelect('SUM(invoice.total)', 'total')
      .addSelect('SUM(invoice.total_profit)', 'profit')
      .getRawOne();

    // Get this month's sales
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthSales = await this.saleRepository
      .createQueryBuilder('invoice')
      .where('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :monthStart', { monthStart })
      .select('COUNT(*)', 'count')
      .addSelect('SUM(invoice.total)', 'total')
      .addSelect('SUM(invoice.total_profit)', 'profit')
      .getRawOne();

    // Get location-wise statistics if no specific location
    let locationStats = [];
    if (!locationId) {
      for (const location of locations) {
        const locSales = await this.saleRepository
          .createQueryBuilder('invoice')
          .where('invoice.business_id = :businessId', { businessId })
          .andWhere('invoice.location_id = :locationId', {
            locationId: location.id,
          })
          .andWhere('invoice.created_at >= :today', { today })
          .select('COUNT(*)', 'count')
          .addSelect('SUM(invoice.total)', 'total')
          .getRawOne();

        locationStats.push({
          location_id: location.id,
          location_name: location.name,
          today_sales: parseFloat(locSales.total || 0),
          today_transactions: parseInt(locSales.count || 0),
        });
      }
    }

    return {
      business_id: businessId,
      location_id: locationId,
      overview: {
        total_locations: locations.length,
        active_locations: locations.filter((l) => l.status === 'active').length,
        total_users: activeUsers,
        total_products: totalProducts,
      },
      today: {
        sales: parseFloat(todaySales.total || 0),
        transactions: parseInt(todaySales.count || 0),
        profit: parseFloat(todaySales.profit || 0),
      },
      this_month: {
        sales: parseFloat(monthSales.total || 0),
        transactions: parseInt(monthSales.count || 0),
        profit: parseFloat(monthSales.profit || 0),
      },
      location_stats: locationStats,
    };
  }

  // Business Settings
  async getBusinessInfo(businessId: string): Promise<Business> {
    return this.businessRepository.findOne({
      where: { id: businessId },
    });
  }

  async updateBusinessInfo(
    businessId: string,
    data: Partial<Business>,
  ): Promise<Business> {
    await this.businessRepository.update({ id: businessId }, data);
    return this.businessRepository.findOne({
      where: { id: businessId },
    });
  }

  // User Sessions
  async getActiveSessions(businessId: string): Promise<UserSession[]> {
    return this.sessionRepository
      .createQueryBuilder('session')
      .where('session.business_id = :businessId', { businessId })
      .andWhere('session.status = :status', { status: 'active' })
      .orderBy('session.login_time', 'DESC')
      .limit(50)
      .getMany();
  }

  // Reports
  async getSalesReport(
    businessId: string,
    startDate: string,
    endDate: string,
    locationId?: string,
  ): Promise<any> {
    const query = this.saleRepository
      .createQueryBuilder('invoice')
      .where('invoice.business_id = :businessId', { businessId })
      .andWhere('invoice.created_at >= :startDate', { startDate })
      .andWhere('invoice.created_at <= :endDate', { endDate });

    if (locationId) {
      query.andWhere('invoice.location_id = :locationId', { locationId });
    }

    const sales = await query
      .select([
        'invoice.sale_date as sale_date',
        'COUNT(*) as transactions',
        'SUM(invoice.total) as total_sales',
        'SUM(invoice.total_profit) as total_profit',
        'AVG(invoice.total) as avg_transaction',
      ])
      .groupBy('invoice.sale_date')
      .orderBy('invoice.sale_date', 'DESC')
      .getRawMany();

    const summary = await query
      .select([
        'COUNT(*) as total_transactions',
        'SUM(invoice.total) as total_sales',
        'SUM(invoice.total_profit) as total_profit',
        'AVG(invoice.total) as avg_transaction',
        'MAX(invoice.total) as max_transaction',
      ])
      .getRawOne();

    return {
      start_date: startDate,
      end_date: endDate,
      location_id: locationId,
      summary: {
        total_transactions: parseInt(summary?.total_transactions || 0),
        total_sales: parseFloat(summary?.total_sales || 0),
        total_profit: parseFloat(summary?.total_profit || 0),
        avg_transaction: parseFloat(summary?.avg_transaction || 0),
        max_transaction: parseFloat(summary?.max_transaction || 0),
      },
      daily_breakdown: sales.map((s) => ({
        date: s.sale_date,
        transactions: parseInt(s.transactions),
        sales: parseFloat(s.total_sales),
        profit: parseFloat(s.total_profit),
        avg_transaction: parseFloat(s.avg_transaction),
      })),
    };
  }
}
