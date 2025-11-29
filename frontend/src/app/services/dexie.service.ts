import Dexie from 'dexie';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';

export interface AppDBSchema {
  products: Product[];
}

@Injectable({ providedIn: 'root' })
export class DexieService extends Dexie {
  products: Dexie.Table<Product, string>;

  constructor() {
    super('matrix_pos_db');
    this.version(1).stores({
      products: 'id, name, sku'
    });
    this.products = this.table('products');
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
