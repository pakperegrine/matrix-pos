import { Component, Input, Output, EventEmitter } from '@angular/core';

interface CartItem {
  product: any;
  qty: number;
}

@Component({
  selector: 'app-cart-panel',
  templateUrl: './cart-panel.component.html',
  styleUrls: ['./cart-panel.component.scss']
})
export class CartPanelComponent {
  @Input() cart: CartItem[] = [];
  @Input() total: number = 0;
  
  @Output() updateQuantity = new EventEmitter<{ product: any; qty: number }>();
  @Output() removeItem = new EventEmitter<any>();
  @Output() checkout = new EventEmitter<void>();
  @Output() clearCart = new EventEmitter<void>();

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
