import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Discount, DiscountResult } from '../../models/discount';
import { SettingsService } from '../../services/settings.service';

interface CartItem {
  product: any;
  qty: number;
}

@Component({
  selector: 'app-cart-panel',
  templateUrl: './cart-panel.component.html',
  styleUrls: ['./cart-panel.component.scss']
})
export class CartPanelComponent implements OnChanges {
  // Make Array available in template
  Array = Array;
  
  @Input() cart: any[] = [];
  @Input() subtotal: number = 0;
  @Input() total: number = 0;
  @Input() discountAmount: number = 0;
  @Input() taxAmount: number = 0;
  @Input() activeDiscounts: Discount[] = [];
  @Input() selectedDiscountId: string = '';
  @Input() couponCode: string = '';
  @Input() appliedDiscounts: DiscountResult | null = null;
  @Input() validatingCoupon: boolean = false;
  
  @Output() updateQuantity = new EventEmitter<{ product: any; qty: number }>();
  @Output() removeItem = new EventEmitter<any>();
  @Output() checkout = new EventEmitter<void>();
  @Output() clearCart = new EventEmitter<void>();
  @Output() discountChange = new EventEmitter<string>();
  @Output() applyCoupon = new EventEmitter<void>();
  @Output() removeCoupon = new EventEmitter<void>();
  @Output() couponCodeChange = new EventEmitter<string>();

  localCouponCode: string = '';

  constructor(public settingsService: SettingsService) {}

  ngOnChanges() {
    // Sync local coupon code with input
    if (this.couponCode !== this.localCouponCode) {
      this.localCouponCode = this.couponCode;
    }
  }

  get totalItems(): number {
    return (this.cart || []).reduce((sum, item) => sum + (item?.qty || 0), 0);
  }

  get averagePerItem(): number {
    return this.totalItems > 0 ? this.total / this.totalItems : 0;
  }

  onCouponCodeChange(): void {
    this.couponCodeChange.emit(this.localCouponCode);
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

  onDiscountChange(event: any): void {
    this.discountChange.emit(event.target.value);
  }

  onApplyCoupon(): void {
    this.applyCoupon.emit();
  }

  onRemoveCoupon(): void {
    this.removeCoupon.emit();
  }
}
