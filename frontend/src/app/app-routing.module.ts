import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PosComponent } from './components/pos/pos.component';
import { ProductManagementComponent } from './components/product-management/product-management.component';
import { SalesDashboardComponent } from './components/sales-dashboard/sales-dashboard.component';
import { PendingTransactionsComponent } from './components/shared/pending-transactions/pending-transactions.component';
import { CustomerManagementComponent } from './components/customer-management/customer-management.component';
import { DiscountManagementComponent } from './components/discount-management/discount-management.component';
import { ReportsComponent } from './components/reports/reports.component';
import { CurrencySettingsComponent } from './components/currency-settings/currency-settings.component';
import { InventoryForecastingComponent } from './components/inventory-forecasting/inventory-forecasting.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: '/pos', pathMatch: 'full' },
  { path: 'pos', component: PosComponent },
  { path: 'products', component: ProductManagementComponent },
  { path: 'sales', component: SalesDashboardComponent },
  { path: 'sync', component: PendingTransactionsComponent },
  { path: 'customers', component: CustomerManagementComponent },
  { path: 'discounts', component: DiscountManagementComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'currency', component: CurrencySettingsComponent },
  { path: 'forecasting', component: InventoryForecastingComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/pos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

