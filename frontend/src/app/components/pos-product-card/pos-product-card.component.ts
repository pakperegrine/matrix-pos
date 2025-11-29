import { Component, Input } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-pos-product-card',
  templateUrl: './pos-product-card.component.html',
  styleUrls: ['./pos-product-card.component.scss']
})
export class PosProductCardComponent {
  @Input() product!: Product;
}
