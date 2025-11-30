import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findAll(
    businessId: string,
    options: {
      search?: string;
      customer_type?: string;
      is_active?: number;
      limit?: number;
      offset?: number;
    },
  ) {
    const query = this.customerRepository.createQueryBuilder('customer');
    query.where('customer.business_id = :businessId', { businessId });

    if (options.search) {
      query.andWhere(
        '(customer.name LIKE :search OR customer.email LIKE :search OR customer.phone LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options.customer_type) {
      query.andWhere('customer.customer_type = :customer_type', {
        customer_type: options.customer_type,
      });
    }

    if (options.is_active !== undefined) {
      query.andWhere('customer.is_active = :is_active', {
        is_active: options.is_active,
      });
    }

    query.orderBy('customer.created_at', 'DESC');
    query.skip(options.offset || 0);
    query.take(options.limit || 50);

    const [customers, total] = await query.getManyAndCount();

    return {
      customers,
      total,
      limit: options.limit,
      offset: options.offset,
    };
  }

  async findOne(businessId: string, id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, business_id: businessId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async getPurchaseHistory(businessId: string, customerId: string, limit: number = 10) {
    // This will be integrated with sale_invoices later
    // For now, return empty array
    return {
      purchases: [],
      total: 0,
    };
  }

  async getStatistics(businessId: string, customerId: string) {
    const customer = await this.findOne(businessId, customerId);

    return {
      customer_id: customer.id,
      name: customer.name,
      total_purchases: customer.total_purchases,
      purchase_count: customer.purchase_count,
      loyalty_points: customer.loyalty_points,
      loyalty_tier: customer.loyalty_tier,
      current_balance: customer.current_balance,
      credit_limit: customer.credit_limit,
      last_purchase_date: customer.last_purchase_date,
      customer_since: customer.created_at,
      average_purchase: customer.purchase_count > 0
        ? customer.total_purchases / customer.purchase_count
        : 0,
    };
  }

  async create(businessId: string, customerData: Partial<Customer>): Promise<Customer> {
    // Check if email or phone already exists for this business
    if (customerData.email) {
      const existing = await this.customerRepository.findOne({
        where: { business_id: businessId, email: customerData.email },
      });
      if (existing) {
        throw new BadRequestException('Customer with this email already exists');
      }
    }

    const customer = this.customerRepository.create({
      ...customerData,
      business_id: businessId,
    });

    return this.customerRepository.save(customer);
  }

  async update(
    businessId: string,
    id: string,
    customerData: Partial<Customer>,
  ): Promise<Customer> {
    const customer = await this.findOne(businessId, id);

    // Check email uniqueness if changing
    if (customerData.email && customerData.email !== customer.email) {
      const existing = await this.customerRepository.findOne({
        where: { business_id: businessId, email: customerData.email },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Customer with this email already exists');
      }
    }

    Object.assign(customer, customerData);
    return this.customerRepository.save(customer);
  }

  async delete(businessId: string, id: string): Promise<void> {
    const customer = await this.findOne(businessId, id);
    await this.customerRepository.remove(customer);
  }

  async addLoyaltyPoints(
    businessId: string,
    customerId: string,
    points: number,
    reason?: string,
  ): Promise<Customer> {
    const customer = await this.findOne(businessId, customerId);

    customer.loyalty_points += points;

    // Update loyalty tier based on points
    customer.loyalty_tier = this.calculateLoyaltyTier(customer.loyalty_points);

    await this.customerRepository.save(customer);

    // TODO: Log loyalty points transaction
    return customer;
  }

  async redeemPoints(
    businessId: string,
    customerId: string,
    points: number,
  ): Promise<Customer> {
    const customer = await this.findOne(businessId, customerId);

    if (customer.loyalty_points < points) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    customer.loyalty_points -= points;
    customer.loyalty_tier = this.calculateLoyaltyTier(customer.loyalty_points);

    await this.customerRepository.save(customer);

    // TODO: Log loyalty points redemption
    return customer;
  }

  async updatePurchaseStats(
    businessId: string,
    customerId: string,
    amount: number,
  ): Promise<void> {
    const customer = await this.findOne(businessId, customerId);

    customer.total_purchases += amount;
    customer.purchase_count += 1;
    customer.last_purchase_date = new Date();

    // Award loyalty points (1 point per dollar spent)
    const pointsEarned = Math.floor(amount);
    customer.loyalty_points += pointsEarned;
    customer.loyalty_tier = this.calculateLoyaltyTier(customer.loyalty_points);

    await this.customerRepository.save(customer);
  }

  private calculateLoyaltyTier(points: number): string {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 2000) return 'silver';
    return 'bronze';
  }
}
