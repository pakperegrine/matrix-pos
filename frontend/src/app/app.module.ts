import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { PosComponent } from './components/pos/pos.component';
import { PosProductCardComponent } from './components/pos-product-card/pos-product-card.component';
import { CartPanelComponent } from './components/cart-panel/cart-panel.component';
import { PosGridComponent } from './components/pos-grid/pos-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    PosComponent,
    PosProductCardComponent,
    CartPanelComponent,
    PosGridComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
