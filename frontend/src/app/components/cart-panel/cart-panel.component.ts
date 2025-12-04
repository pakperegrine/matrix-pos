import { Component, Input, Output, EventEmitter, AfterViewChecked } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

interface CartItem {
  product: any;
  qty: number;
}

@Component({
  selector: 'app-cart-panel',
  standalone: false,
  templateUrl: './cart-panel.component.html',
  styleUrls: ['./cart-panel.component.scss']
})
export class CartPanelComponent implements AfterViewChecked {
  // Make Array available in template
  Array = Array;
  
  @Input() cart: any[] = [];
  @Input() subtotal: number = 0;
  @Input() total: number = 0;
  @Input() discountAmount: number = 0;
  @Input() taxAmount: number = 0;
  
  @Output() updateQuantity = new EventEmitter<{ product: any; qty: number }>();
  @Output() removeItem = new EventEmitter<any>();
  @Output() checkout = new EventEmitter<void>();
  @Output() clearCart = new EventEmitter<void>();

  constructor(public settingsService: SettingsService) {}

  ngAfterViewChecked() {
    // Scroll to the last item when cart changes
    if (this.cart.length > 0) {
      const cartItems = document.querySelector('.cart-items');
      if (cartItems) {
        cartItems.scrollTop = cartItems.scrollHeight;
      }
    }
  }

  trackByProductId(index: number, item: any): any {
    return item.product.id;
  }

  get totalItems(): number {
    return (this.cart || []).reduce((sum, item) => sum + (item?.qty || 0), 0);
  }

  get averagePerItem(): number {
    return this.totalItems > 0 ? this.total / this.totalItems : 0;
  }

  increaseQty(item: CartItem): void {
    this.updateQuantity.emit({ product: item.product, qty: item.qty + 1 });
  }

  decreaseQty(item: CartItem): void {
    if (item.qty > 1) {
      this.updateQuantity.emit({ product: item.product, qty: item.qty - 1 });
    } else {
      this.removeItem.emit(item.product);
    }
  }

  onRemoveItem(item: CartItem): void {
    this.removeItem.emit(item.product);
  }

  onCheckout(): void {
    this.checkout.emit();
  }

  onClearCart(): void {
    this.clearCart.emit();
  }
}
