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
import { SyncStatusComponent } from './components/shared/sync-status/sync-status.component';
import { PendingTransactionsComponent } from './components/shared/pending-transactions/pending-transactions.component';
import { ProductManagementComponent } from './components/product-management/product-management.component';
import { SalesDashboardComponent } from './components/sales-dashboard/sales-dashboard.component';
import { CustomerManagementComponent } from './components/customer-management/customer-management.component';
import { DiscountManagementComponent } from './components/discount-management/discount-management.component';
import { ReportsComponent } from './components/reports/reports.component';
import { CurrencySettingsComponent } from './components/currency-settings/currency-settings.component';
import { InventoryForecastingComponent } from './components/inventory-forecasting/inventory-forecasting.component';
import { SettingsComponent } from './components/settings/settings.component';
import { CustomCurrencyPipe } from './pipes/custom-currency.pipe';

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
    SyncStatusComponent,
    PendingTransactionsComponent,
    ProductManagementComponent,
    SalesDashboardComponent,
    CustomerManagementComponent,
    DiscountManagementComponent,
    ReportsComponent,
    CurrencySettingsComponent,
    InventoryForecastingComponent,
    SettingsComponent,
    CustomCurrencyPipe
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
