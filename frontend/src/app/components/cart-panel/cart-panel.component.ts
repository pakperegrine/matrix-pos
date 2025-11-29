import { Component, Input } from '@angular/core';

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
}
