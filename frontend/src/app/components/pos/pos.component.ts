import { Component, OnInit } from '@angular/core';
import { DexieService } from '../../services/dexie.service';
import { Product } from '../../models/product';

interface CartItem {
  product: Product;
  qty: number;
}

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  cart: CartItem[] = [];

  constructor(private db: DexieService) {}

  async ngOnInit() {
    await this.db.seedSample();
    this.products = await this.db.products.toArray();
  }

  addToCart(p: Product) {
    const found = this.cart.find(c => c.product.id === p.id);
    if (found) found.qty += 1;
    else this.cart.push({ product: p, qty: 1 });
  }

  get total() {
    return this.cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  }

  async syncOfflineSale() {
    // Build a simple payload; in production include business_id, invoice_no etc.
    const payload = {
      source: 'offline',
      items: this.cart.map(c => ({ product_id: c.product.id, quantity: c.qty, sale_price: c.product.price }))
    };

    try {
      const res = await fetch('/sync/offline-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      alert('Sync successful: ' + JSON.stringify(data));
      this.cart = [];
    } catch (err) {
      console.error('Sync failed', err);
      alert('Sync failed, see console');
    }
  }
}
