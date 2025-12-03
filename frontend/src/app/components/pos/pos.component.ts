import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DexieService } from '../../services/dexie.service';
import { SyncService } from '../../services/sync.service';
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';
import { Product } from '../../models/product';
import { Discount, DiscountResult, DiscountCalculation } from '../../models/discount';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
  // Make Array available in template
  Array = Array;
  
  @ViewChild('cashAmountInput') cashAmountInput?: ElementRef<HTMLInputElement>;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  cart: CartItem[] = [];
  showCheckoutModal: boolean = false;
  paymentMethod: string = 'cash';
  amountPaid: number = 0;
  processingCheckout: boolean = false;
  
  // Search and filter
  searchQuery: string = '';
  selectedCategory: string = '';
  categories: string[] = [];
  
  // Discount functionality
  activeDiscounts: Discount[] = [];
  selectedDiscountId: string = '';
  couponCode: string = '';
  appliedDiscounts: DiscountResult | null = null;
  validatingCoupon: boolean = false;
  selectedCustomerId: string = '';
  customers: any[] = [];
  customersLoading: boolean = false;
  customersInput$ = new Subject<string>();

  // Getter for safe access to applied discounts array
  get appliedDiscountsList(): DiscountCalculation[] {
    return this.appliedDiscounts?.applied_discounts || [];
  }

  constructor(
    private db: DexieService,
    private syncService: SyncService,
    private toastService: ToastService,
    private http: HttpClient,
    public settingsService: SettingsService
  ) {}

  async ngOnInit() {
    await this.loadProducts();
    this.loadActiveDiscounts();
    
    // Load customers (will be shown conditionally in template based on settings)
    this.loadCustomers();

    // Setup customer search
    this.customersInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.searchCustomers(term))
    ).subscribe();
  }

  async loadProducts(): Promise<void> {
    try {
      // Try to load from API first
      const products = await this.http.get<Product[]>(`${environment.apiUrl}/products`).toPromise();
      if (products && products.length > 0) {
        this.products = products;
        // Update local database
        await this.db.products.clear();
        await this.db.products.bulkAdd(products);
      } else {
        // Fallback to local database if API returns empty
        this.products = await this.db.products.toArray();
      }
    } catch (error) {
      console.error('Error loading products from API, using local database:', error);
      // Fallback to local database on error
      this.products = await this.db.products.toArray();
      if (this.products.length === 0) {
        // If local is also empty, seed sample data
        await this.db.seedSample();
        this.products = await this.db.products.toArray();
      }
    }
    this.extractCategories();
    this.applyFilters();
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.products.forEach(p => {
      if (p.category_id) {
        categorySet.add(p.category_id);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category_id === this.selectedCategory);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    this.filteredProducts = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // Check for exact match on barcode or SKU
      const query = this.searchQuery.trim();
      if (!query) return;

      const exactMatch = this.products.find(p => 
        (p.barcode && p.barcode === query) ||
        (p.sku && p.sku === query)
      );

      if (exactMatch) {
        this.addToCart(exactMatch);
        this.searchQuery = '';
        this.applyFilters();
      } else if (this.filteredProducts.length === 1) {
        // If only one result, add it to cart
        this.addToCart(this.filteredProducts[0]);
        this.searchQuery = '';
        this.applyFilters();
      }
    }
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.applyFilters();
  }

  loadActiveDiscounts(): void {
    this.http.get<Discount[]>(`${environment.apiUrl}/discounts/active`)
      .subscribe({
        next: (discounts) => {
          this.activeDiscounts = discounts;
        },
        error: (error) => {
          console.error('Error loading discounts:', error);
        }
      });
  }

  loadCustomers(search: string = ''): void {
    this.customersLoading = true;
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    
    this.http.get<any>(`${environment.apiUrl}/customers${params}`)
      .subscribe({
        next: (customersResponse) => {
          console.log('Customers API response:', customersResponse);
          if (Array.isArray(customersResponse)) {
            this.customers = customersResponse;
          } else if (customersResponse && Array.isArray(customersResponse?.customers)) {
            this.customers = customersResponse.customers;
          } else if (customersResponse && Array.isArray(customersResponse?.data)) {
            this.customers = customersResponse.data;
          } else {
            console.warn('Customers response was not an array. Falling back to empty list.', customersResponse);
            this.customers = [];
          }
          this.customersLoading = false;
        },
        error: (error) => {
          console.error('Error loading customers:', error);
          this.customers = [];
          this.customersLoading = false;
        }
      });
  }

  searchCustomers(term: string) {
    this.loadCustomers(term);
    return [];
  }

  onCustomerSearch(term: string) {
    this.customersInput$.next(term);
  }

  addToCart(p: Product) {
    const found = this.cart.find(c => c.product.id === p.id);
    if (found) {
      found.qty += 1;
    } else {
      this.cart.push({ product: p, qty: 1 });
    }
    this.toastService.success(`${p.name} added to cart`);
    // Auto-calculate discounts for automatic discounts
    this.calculateDiscounts();
  }

  updateQuantity(event: { product: any; qty: number }) {
    const found = this.cart.find(c => c.product.id === event.product.id);
    if (found) {
      found.qty = event.qty;
    }
    // Recalculate discounts when quantity changes
    this.calculateDiscounts();
  }

  removeItem(product: any) {
    this.cart = this.cart.filter(c => c.product.id !== product.id);
    this.toastService.info(`${product.name} removed from cart`);
    // Recalculate discounts when item is removed
    this.calculateDiscounts();
  }

  clearCart() {
    this.cart = [];
    this.appliedDiscounts = null;
    this.selectedDiscountId = '';
    this.couponCode = '';
    this.toastService.info('Cart cleared');
  }

  async calculateDiscounts(silent: boolean = true): Promise<void> {
    if (this.cart.length === 0) {
      this.appliedDiscounts = null;
      return;
    }

    const cartItems = this.cart.map(c => ({
      product_id: c.product.id,
      quantity: c.qty,
      unit_price: c.product.price,
      category_id: c.product.category_id
    }));

    const couponCodes = this.couponCode ? [this.couponCode.toUpperCase()] : [];

    try {
      const result = await this.http.post<DiscountResult>(
        `${environment.apiUrl}/discounts/calculate`,
        {
          cart_items: cartItems,
          customer_id: this.selectedCustomerId || undefined,
          coupon_codes: couponCodes
        }
      ).toPromise();

      this.appliedDiscounts = result || null;

      // Only show toast if not silent (manual coupon application)
      if (!silent && result && result.applied_discounts.length > 0) {
        const discountNames = result.applied_discounts.map(d => d.discount_name).join(', ');
        this.toastService.success(
          `Applied: ${discountNames}`,
          `Saved $${result.total_discount.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error('Error calculating discounts:', error);
      if (!silent) {
        this.toastService.error('Failed to calculate discounts');
      }
    }
  }

  async applyCouponCode(): Promise<void> {
    if (!this.couponCode.trim()) {
      this.toastService.warning('Please enter a coupon code');
      return;
    }

    this.validatingCoupon = true;

    try {
      const validation = await this.http.post<any>(
        `${environment.apiUrl}/discounts/validate-code`,
        {
          code: this.couponCode.toUpperCase(),
          cart_total: this.subtotal,
          customer_id: this.selectedCustomerId || undefined
        }
      ).toPromise();

      if (validation.valid) {
        this.toastService.success(`Coupon "${this.couponCode}" applied!`);
        await this.calculateDiscounts(false); // Show toast for manual coupon application
      } else {
        this.toastService.error(validation.message || 'Invalid coupon code', 'Coupon Error');
        this.couponCode = '';
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      this.toastService.error('Failed to validate coupon code');
    } finally {
      this.validatingCoupon = false;
    }
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.calculateDiscounts();
    this.toastService.info('Coupon removed');
  }

  onDiscountChange(): void {
    this.calculateDiscounts();
  }

  get subtotal() {
    return this.cart.reduce((sum, c) => sum + (c.product.price * c.qty), 0);
  }

  get discountAmount() {
    return this.appliedDiscounts?.total_discount || 0;
  }

  get subtotalAfterDiscount() {
    return this.subtotal - this.discountAmount;
  }

  get taxAmount() {
    return this.settingsService.calculateTax(this.subtotalAfterDiscount);
  }

  get total() {
    const subtotalAfterDiscount = this.subtotalAfterDiscount;
    if (this.settingsService.isTaxEnabled()) {
      const taxType = this.settingsService.getTaxType();
      if (taxType === 'exclusive') {
        return subtotalAfterDiscount + this.taxAmount;
      }
    }
    return subtotalAfterDiscount;
  }

  get change() {
    return Math.max(0, this.amountPaid - this.total);
  }

  openCheckout() {
    if (this.cart.length === 0) {
      this.toastService.warning('Cart is empty', 'Cannot checkout');
      return;
    }
    this.paymentMethod = 'cash';
    this.showCheckoutModal = true;
    this.amountPaid = this.total;
    setTimeout(() => this.focusCashInput(), 0);
  }

  closeCheckout() {
    this.showCheckoutModal = false;
    this.amountPaid = 0;
    this.paymentMethod = 'cash';
  }

  onPaymentMethodChange(method: string) {
    if (method === 'cash') {
      setTimeout(() => this.focusCashInput(), 0);
    }
  }

  private focusCashInput(): void {
    if (this.cashAmountInput?.nativeElement) {
      this.cashAmountInput.nativeElement.focus();
      this.cashAmountInput.nativeElement.select();
    }
  }

  async processCheckout() {
    // Check if customer is required
    if (this.settingsService.isCustomerRequired() && !this.selectedCustomerId) {
      this.toastService.error('Please select a customer', 'Customer Required');
      return;
    }

    if (this.paymentMethod === 'cash' && this.amountPaid < this.total) {
      this.toastService.error('Amount paid is less than total', 'Payment Error');
      return;
    }

    this.processingCheckout = true;

    const temp_invoice_no = `TEMP-${Date.now()}`;
    const saleData = {
      temp_invoice_no,
      customer_name: 'Walk-in Customer',
      customer_id: this.selectedCustomerId || undefined,
      subtotal: this.subtotal,
      discount_amount: this.discountAmount,
      tax_amount: this.taxAmount,
      total_amount: this.total,
      payment_method: this.paymentMethod,
      applied_discounts: this.appliedDiscounts?.applied_discounts || [],
      items: this.cart.map(c => ({
        product_id: c.product.id,
        quantity: c.qty,
        unit_price: c.product.price
      }))
    };

    try {
      // Check if online
      if (this.syncService.isOnline()) {
        // Try to sync immediately
        const payload = {
          source: 'offline',
          payment_method: this.paymentMethod,
          items: saleData.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            sale_price: item.unit_price
          }))
        };

        try {
          await this.http.post<any>('http://localhost:3000/api/sync/offline-sale', payload).toPromise();
          this.toastService.success('Sale completed and synced', 'Success');
        } catch (err) {
          // If sync fails, save for later
          console.warn('Failed to sync immediately, saving offline:', err);
          await this.syncService.saveOfflineSale(saleData);
          this.toastService.warning('Sale saved offline, will sync later', 'Offline Mode');
        }
      } else {
        // Save offline
        await this.syncService.saveOfflineSale(saleData);
        this.toastService.warning('Sale saved offline, will sync when online', 'Offline Mode');
      }
      
      // Print receipt
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

    // Get customer name
    const selectedCustomer = this.customers.find(c => c.id === this.selectedCustomerId);
    const customerName = selectedCustomer ? selectedCustomer.name : 'Walk-in Customer';
    const customerInfo = selectedCustomer && (selectedCustomer.phone || selectedCustomer.email) 
      ? `${selectedCustomer.phone || selectedCustomer.email}` 
      : '';

    const discountLines = this.appliedDiscounts?.applied_discounts.map(d => `
      <tr>
        <td colspan="2">${d.discount_name}</td>
        <td class="right">-${this.settingsService.formatCurrency(d.discount_amount)}</td>
      </tr>
    `).join('') || '';

    const businessInfo = this.settingsService.showBusinessInfoOnReceipt() ? `
      <h2>${this.settingsService.getBusinessName()}</h2>
      ${this.settingsService.getBusinessAddress() ? `<div class="center">${this.settingsService.getBusinessAddress()}</div>` : ''}
      ${this.settingsService.getBusinessPhone() ? `<div class="center">${this.settingsService.getBusinessPhone()}</div>` : ''}
    ` : '<h2>Matrix POS</h2>';

    const taxLine = this.settingsService.isTaxEnabled() && this.settingsService.showTaxOnReceipt() ? `
      <tr>
        <td colspan="2">${this.settingsService.getTaxLabel()} (${this.settingsService.getTaxRate()}%):</td>
        <td class="right">${this.settingsService.formatCurrency(this.taxAmount)}</td>
      </tr>
    ` : '';

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
          .subtotal { border-top: 1px solid #ccc; }
          .discount { color: #22c55e; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        ${businessInfo}
        ${this.settingsService.getReceiptHeader() ? `<div class="center">${this.settingsService.getReceiptHeader()}</div>` : '<div class="center">Receipt</div>'}
        <div class="center">${new Date().toLocaleString()}</div>
        <hr>
        <div class="center"><strong>Customer: ${customerName}</strong></div>
        ${customerInfo ? `<div class="center">${customerInfo}</div>` : ''}
        <hr>
        <table>
          ${this.cart.map(c => `
            <tr>
              <td>${c.product.name}</td>
              <td class="right">${c.qty} x ${this.settingsService.formatCurrency(c.product.price)}</td>
              <td class="right">${this.settingsService.formatCurrency(c.qty * c.product.price)}</td>
            </tr>
          `).join('')}
          <tr class="subtotal">
            <td colspan="2">Subtotal:</td>
            <td class="right">${this.settingsService.formatCurrency(this.subtotal)}</td>
          </tr>
          ${discountLines ? `${discountLines}` : ''}
          ${this.discountAmount > 0 ? `
          <tr class="discount">
            <td colspan="2"><strong>Total Discount:</strong></td>
            <td class="right"><strong>-${this.settingsService.formatCurrency(this.discountAmount)}</strong></td>
          </tr>
          ` : ''}
          ${taxLine}
          <tr class="total">
            <td colspan="2">Total:</td>
            <td class="right">${this.settingsService.formatCurrency(this.total)}</td>
          </tr>
          <tr>
            <td colspan="2">Paid (${this.paymentMethod}):</td>
            <td class="right">${this.settingsService.formatCurrency(this.amountPaid)}</td>
          </tr>
          <tr>
            <td colspan="2">Change:</td>
            <td class="right">${this.settingsService.formatCurrency(this.change)}</td>
          </tr>
        </table>
        <hr>
        ${this.discountAmount > 0 ? `<div class="center" style="color: #22c55e;">You saved ${this.settingsService.formatCurrency(this.discountAmount)}!</div>` : ''}
        ${this.settingsService.getReceiptFooter() ? `<div class="center">${this.settingsService.getReceiptFooter()}</div>` : '<div class="center">Thank you!</div>'}
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  }
}
