import { Component, OnInit } from '@angular/core';
import { DexieService } from '../../services/dexie.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product';
import { HttpClient } from '@angular/common/http';

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
  showCheckoutModal: boolean = false;
  paymentMethod: string = 'cash';
  amountPaid: number = 0;
  processingCheckout: boolean = false;

  constructor(
    private db: DexieService,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    await this.db.seedSample();
    this.products = await this.db.products.toArray();
  }

  addToCart(p: Product) {
    const found = this.cart.find(c => c.product.id === p.id);
    if (found) {
      found.qty += 1;
    } else {
      this.cart.push({ product: p, qty: 1 });
    }
    this.toastService.success(`${p.name} added to cart`);
  }

  updateQuantity(event: { product: any; qty: number }) {
    const found = this.cart.find(c => c.product.id === event.product.id);
    if (found) {
      found.qty = event.qty;
    }
  }

  removeItem(product: any) {
    this.cart = this.cart.filter(c => c.product.id !== product.id);
    this.toastService.info(`${product.name} removed from cart`);
  }

  clearCart() {
    this.cart = [];
    this.toastService.info('Cart cleared');
  }

  get total() {
    return this.cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  }

  get change() {
    return Math.max(0, this.amountPaid - this.total);
  }

  openCheckout() {
    if (this.cart.length === 0) {
      this.toastService.warning('Cart is empty', 'Cannot checkout');
      return;
    }
    this.showCheckoutModal = true;
    this.amountPaid = this.total;
  }

  closeCheckout() {
    this.showCheckoutModal = false;
    this.amountPaid = 0;
    this.paymentMethod = 'cash';
  }

  async processCheckout() {
    if (this.paymentMethod === 'cash' && this.amountPaid < this.total) {
      this.toastService.error('Amount paid is less than total', 'Payment Error');
      return;
    }

    this.processingCheckout = true;

    const payload = {
      source: 'offline',
      payment_method: this.paymentMethod,
      items: this.cart.map(c => ({
        product_id: c.product.id,
        quantity: c.qty,
        sale_price: c.product.price
      }))
    };

    try {
      const res = await this.http.post<any>('http://localhost:3000/api/sync/offline-sale', payload).toPromise();
      
      this.toastService.success('Sale completed successfully', 'Success');
      
      // Print receipt (simplified version)
      this.printReceipt();
      
      // Clear cart and close modal
      this.cart = [];
      this.closeCheckout();
    } catch (err) {
      console.error('Checkout failed', err);
      this.toastService.error('Failed to process sale', 'Error');
    } finally {
      this.processingCheckout = false;
    }
  }

  printReceipt() {
    const receiptWindow = window.open('', '_blank', 'width=300,height=500');
    if (!receiptWindow) {
      this.toastService.warning('Please allow popups to print receipt');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: monospace; padding: 20px; max-width: 300px; }
          h2 { text-align: center; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td { padding: 4px 0; }
          .right { text-align: right; }
          .total { border-top: 2px solid black; font-weight: bold; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h2>Matrix POS</h2>
        <div class="center">Receipt</div>
        <div class="center">${new Date().toLocaleString()}</div>
        <hr>
        <table>
          ${this.cart.map(c => `
            <tr>
              <td>${c.product.name}</td>
              <td class="right">${c.qty} x $${c.product.price.toFixed(2)}</td>
              <td class="right">$${(c.qty * c.product.price).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td colspan="2">Total:</td>
            <td class="right">$${this.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2">Paid (${this.paymentMethod}):</td>
            <td class="right">$${this.amountPaid.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2">Change:</td>
            <td class="right">$${this.change.toFixed(2)}</td>
          </tr>
        </table>
        <hr>
        <div class="center">Thank you!</div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  }
}
