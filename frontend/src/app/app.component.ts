import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LocationService, Location } from './services/location.service';
import { AuthService, User } from './services/auth.service';
import { ShiftService } from './services/shift.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Matrix POS';
  pageTitle = 'Point of Sale';
  showSidebar = false;
  isAuthenticated = false;
  userName = 'Admin';
  userRole = 'Administrator';
  userRoleType: 'owner' | 'admin' | 'manager' | 'cashier' = 'admin';
  
  // Location selector
  locations: Location[] = [];
  selectedLocation: Location | null = null;
  showLocationSelector = false;
  
  // Shift status
  hasActiveShift = false;
  currentShiftNumber = '';
  showShiftStatus = false;

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
    '/owner': 'Owner Dashboard',
    '/cash-management': 'Cash Management'
  };

  constructor(
    private router: Router,
    private locationService: LocationService,
    private authService: AuthService,
    private shiftService: ShiftService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.loadUserInfo(user);
        this.loadLocations();
        // Load active shift and check if shift is required
        this.shiftService.loadActiveShift().subscribe();
      } else {
        this.showSidebar = false;
        this.showLocationSelector = false;
        this.shiftService.clearShift();
      }
    });
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const isLoginPage = event.url.includes('/login');
        this.showSidebar = this.isAuthenticated && !isLoginPage;
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
    
    // Subscribe to shift changes
    this.shiftService.activeShift$.subscribe(shift => {
      this.hasActiveShift = !!shift;
      this.currentShiftNumber = shift?.shiftNumber || '';
      this.showShiftStatus = this.userRoleType === 'cashier' || this.userRoleType === 'manager';
    });
  }

  loadUserInfo(user: User): void {
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

  // Check if user has access to a menu item based on role
  hasMenuAccess(menuItem: string): boolean {
    const rolePermissions: { [key: string]: string[] } = {
      'owner': ['owner', 'reports', 'settings', 'products', 'customers', 'discounts', 'forecasting', 'currency', 'sales'],
      'admin': ['reports', 'products', 'customers', 'discounts', 'forecasting', 'currency', 'sales', 'sync', 'pos'],
      'manager': ['pos', 'products', 'sales', 'customers', 'discounts', 'reports', 'settings'],
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
    this.authService.logout();
    this.locationService.clearSelection();
    this.shiftService.clearShift();
    this.router.navigate(['/login']);
  }
}
