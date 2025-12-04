import { Component, Input } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-pos-product-card',
  standalone: false,
  templateUrl: './pos-product-card.component.html',
  styleUrls: ['./pos-product-card.component.scss']
})
export class PosProductCardComponent {
  @Input() product!: Product;
}
