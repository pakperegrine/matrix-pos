import Dexie from 'dexie';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

export interface OfflineSale {
  id?: number;
  temp_invoice_no: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  created_at: Date;
  sync_status: 'pending' | 'syncing' | 'failed' | 'success';
  sync_error?: string;
  retry_count: number;
  items: any[];
}

export interface AppDBSchema {
  products: Product[];
  offline_sales: OfflineSale[];
}

@Injectable({ providedIn: 'root' })
export class DexieService extends Dexie {
  products: Dexie.Table<Product, string>;
  offline_sales!: Dexie.Table<OfflineSale, number>;

  constructor() {
    super('matrix_pos_db');
    
    // Version 1: Initial schema with products
    this.version(1).stores({
      products: 'id, name, sku'
    });
    
    // Version 2: Add offline_sales table
    this.version(2).stores({
      products: 'id, name, sku',
      offline_sales: '++id, temp_invoice_no, sync_status, created_at'
    });
    
    this.products = this.table('products');
    this.offline_sales = this.table('offline_sales');
  }

  async getDatabase(): Promise<DexieService> {
    await this.open();
    return this;
  }

  async seedSample() {
    const count = await this.products.count();
    if (count === 0) {
      await this.products.bulkAdd([
        { id: 'p1', name: 'Sample Coffee', sku: 'COF-001', price: 2.5, track_inventory: true },
        { id: 'p2', name: 'Sample Sandwich', sku: 'SAN-001', price: 4.0, track_inventory: true }
      ]);
    }
  }
}
