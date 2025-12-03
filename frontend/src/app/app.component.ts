import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Matrix POS';
  pageTitle = 'Point of Sale';
  showSidebar = true;
  userName = 'Admin';
  userRole = 'Administrator';

  private pageTitles: { [key: string]: string } = {
    '/pos': 'Point of Sale',
    '/products': 'Product Management',
    '/sales': 'Sales Dashboard',
    '/customers': 'Customer Management',
    '/discounts': 'Discount Management',
    '/reports': 'Analytics & Reports',
    '/forecasting': 'Inventory Forecasting',
    '/currency': 'Currency Settings',
    '/sync': 'Synchronization',
    '/settings': 'Settings'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showSidebar = !event.url.includes('/login');
        this.pageTitle = this.pageTitles[event.url] || 'Point of Sale';
      });
  }

  loadUserInfo(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name || user.email?.split('@')[0] || 'User';
      this.userRole = 'Administrator';
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('businessId');
    this.router.navigate(['/login']);
  }
}
