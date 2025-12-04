import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
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
import { CashManagementComponent } from './components/cash-management/cash-management.component';
import { OwnerDashboardComponent } from './components/owner-dashboard/owner-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ShiftGuard } from './guards/shift.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/pos', pathMatch: 'full' },
  { path: 'pos', component: PosComponent, canActivate: [AuthGuard, ShiftGuard], data: { requiresShift: true } },
  { path: 'products', component: ProductManagementComponent, canActivate: [AuthGuard] },
  { path: 'sales', component: SalesDashboardComponent, canActivate: [AuthGuard] },
  { path: 'sync', component: PendingTransactionsComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomerManagementComponent, canActivate: [AuthGuard] },
  { path: 'discounts', component: DiscountManagementComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'currency', component: CurrencySettingsComponent, canActivate: [AuthGuard] },
  { path: 'forecasting', component: InventoryForecastingComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [RoleGuard], data: { roles: ['owner', 'manager'] } },
  { path: 'cash-management', component: CashManagementComponent, canActivate: [AuthGuard] },
  { path: 'owner', component: OwnerDashboardComponent, canActivate: [RoleGuard], data: { roles: ['owner'] } },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

