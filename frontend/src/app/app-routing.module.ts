import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PosComponent } from './components/pos/pos.component';
import { ProductManagementComponent } from './components/product-management/product-management.component';

const routes: Routes = [
  { path: '', redirectTo: '/pos', pathMatch: 'full' },
  { path: 'pos', component: PosComponent },
  { path: 'products', component: ProductManagementComponent },
  { path: '**', redirectTo: '/pos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
