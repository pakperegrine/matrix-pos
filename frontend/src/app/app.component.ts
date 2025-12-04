import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LocationService, Location } from './services/location.service';

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
  userRoleType: 'owner' | 'admin' | 'manager' | 'cashier' = 'admin';
  
  // Location selector
  locations: Location[] = [];
  selectedLocation: Location | null = null;
  showLocationSelector = false;

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
    '/settings': 'Settings',
    '/owner': 'Owner Dashboard'
  };

  constructor(
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showSidebar = !event.url.includes('/login');
        this.pageTitle = this.pageTitles[event.url] || 'Point of Sale';
      });
    
    // Subscribe to location changes
    this.locationService.locations$.subscribe(locations => {
      this.locations = locations;
      this.showLocationSelector = this.userRoleType === 'owner' && locations.length > 0;
    });
    
    this.locationService.selectedLocation$.subscribe(location => {
      this.selectedLocation = location;
    });
    
    // Load locations after setting up subscriptions
    this.loadLocations();
  }

  loadUserInfo(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name || user.email?.split('@')[0] || 'User';
      this.userRoleType = user.role || 'admin';
      
      // Set display role name
      const roleNames: { [key: string]: string } = {
        'owner': 'Business Owner',
        'admin': 'Administrator',
        'manager': 'Manager',
        'cashier': 'Cashier'
      };
      this.userRole = roleNames[this.userRoleType] || 'Administrator';
    }
  }

  // Check if user has access to a menu item based on role
  hasMenuAccess(menuItem: string): boolean {
    const rolePermissions: { [key: string]: string[] } = {
      'owner': ['owner', 'reports', 'settings', 'products', 'customers', 'discounts', 'forecasting', 'currency', 'sales'],
      'admin': ['reports', 'settings', 'products', 'customers', 'discounts', 'forecasting', 'currency', 'sales', 'sync', 'pos'],
      'manager': ['pos', 'products', 'sales', 'customers', 'discounts', 'reports'],
      'cashier': ['pos', 'sales', 'customers']
    };

    const allowedMenus = rolePermissions[this.userRoleType] || rolePermissions['cashier'];
    return allowedMenus.includes(menuItem);
  }

  loadLocations(): void {
    if (this.userRoleType === 'owner') {
      this.locationService.loadLocations().subscribe({
        error: (err) => console.error('Error loading locations:', err)
      });
    }
  }
  
  onLocationChange(event: any): void {
    const locationId = event.target.value;
    if (locationId === 'all') {
      this.locationService.selectLocation(null);
    } else {
      const location = this.locations.find(l => l.id === locationId);
      if (location) {
        this.locationService.selectLocation(location);
      }
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('businessId');
    localStorage.removeItem('selectedLocationId');
    this.locationService.clearSelection();
    this.router.navigate(['/login']);
  }
}
