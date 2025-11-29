import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PosComponent } from './components/pos/pos.component';
import { PosProductCardComponent } from './components/pos-product-card/pos-product-card.component';
import { CartPanelComponent } from './components/cart-panel/cart-panel.component';
import { PosGridComponent } from './components/pos-grid/pos-grid.component';
import { TableComponent } from './components/shared/table/table.component';
import { ModalComponent } from './components/shared/modal/modal.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { ThemeToggleComponent } from './components/shared/theme-toggle/theme-toggle.component';
import { ProductManagementComponent } from './components/product-management/product-management.component';

@NgModule({
  declarations: [
    AppComponent,
    PosComponent,
    PosProductCardComponent,
    CartPanelComponent,
    PosGridComponent,
    TableComponent,
    ModalComponent,
    ToastComponent,
    ThemeToggleComponent,
    ProductManagementComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
