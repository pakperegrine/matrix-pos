import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pos-grid',
  templateUrl: './pos-grid.component.html',
  styleUrls: ['./pos-grid.component.scss']
})
export class PosGridComponent {
  @Input() products: any[] = [];
}
