import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LocationService } from '../../services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.scss']
})
export class OwnerDashboardComponent implements OnInit, OnDestroy {
  apiUrl = environment.apiUrl;
  
  dashboardStats: any = null;
  locations: any[] = [];
  users: any[] = [];
  businessInfo: any = null;
  selectedLocation: string = '';
  
  // Reports
  salesReportData: any = null;
  reportStartDate: string = '';
  reportEndDate: string = '';
  
  // UI States
  activeTab: string = 'dashboard';
  loading: boolean = false;
  error: string = '';
  
  // Modal States
  showLocationModal: boolean = false;
  showUserModal: boolean = false;
  editingLocation: any = null;
  editingUser: any = null;
  
  // Form Data
  locationForm: any = {
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    phone: '',
    manager_id: '',
    status: 'active'
  };
  
  userForm: any = {
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    location_id: '',
    status: 'active'
  };
  
  private locationSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.reportStartDate = firstDay.toISOString().split('T')[0];
    this.reportEndDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Subscribe to location changes from header
    this.locationSubscription = this.locationService.selectedLocation$.subscribe(location => {
      this.selectedLocation = location?.id || '';
      this.loadDashboard();
      if (this.salesReportData) {
        this.loadSalesReport();
      }
    });
    
    // Load initial data
    this.loadLocations();
    this.loadUsers();
    this.loadBusinessInfo();
  }
  
  ngOnDestroy(): void {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    const businessId = localStorage.getItem('businessId') || 'business-1';
    const userId = localStorage.getItem('user_id') || 'user-1';
    
    const headers: any = {
      'x-business-id': businessId,
      'x-user-id': userId
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return new HttpHeaders(headers);
  }

  loadDashboard(): void {
    this.loading = true;
    const url = this.selectedLocation 
      ? `${this.apiUrl}/owner/dashboard?location_id=${this.selectedLocation}`
      : `${this.apiUrl}/owner/dashboard`;
    
    this.http.get(url, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => {
        this.dashboardStats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard stats';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadLocations(): void {
    this.http.get(`${this.apiUrl}/locations`, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => {
        this.locations = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Failed to load locations:', err);
      }
    });
  }

  loadUsers(): void {
    this.http.get(`${this.apiUrl}/owner/users`, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => {
        this.users = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  loadBusinessInfo(): void {
    this.http.get(`${this.apiUrl}/owner/business`, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => {
        this.businessInfo = data;
      },
      error: (err) => {
        console.error('Failed to load business info:', err);
      }
    });
  }

  onLocationChange(): void {
    this.loadDashboard();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    if (tab === 'reports') {
      this.loadSalesReport();
    }
  }

  loadSalesReport(): void {
    if (!this.reportStartDate || !this.reportEndDate) return;
    
    this.loading = true;
    const url = this.selectedLocation
      ? `${this.apiUrl}/owner/reports/sales?start_date=${this.reportStartDate}&end_date=${this.reportEndDate}&location_id=${this.selectedLocation}`
      : `${this.apiUrl}/owner/reports/sales?start_date=${this.reportStartDate}&end_date=${this.reportEndDate}`;
    
    this.http.get(url, { headers: this.getHeaders() }).subscribe({
      next: (data: any) => {
        this.salesReportData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load sales report';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Location Management
  openLocationModal(location: any = null): void {
    this.editingLocation = location;
    if (location) {
      // Edit mode - populate form
      this.locationForm = {
        name: location.name || '',
        code: location.code || '',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        country: location.country || '',
        postal_code: location.postal_code || '',
        phone: location.phone || '',
        manager_id: location.manager_id || '',
        status: location.status || 'active'
      };
    } else {
      // Create mode - reset form
      this.locationForm = {
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        phone: '',
        manager_id: '',
        status: 'active'
      };
    }
    this.showLocationModal = true;
  }
  
  closeLocationModal(): void {
    this.showLocationModal = false;
    this.editingLocation = null;
  }
  
  saveLocation(): void {
    if (!this.locationForm.name || !this.locationForm.code) {
      alert('Please fill in required fields (Name and Code)');
      return;
    }
    
    if (this.editingLocation) {
      // Update existing location
      this.http.put(
        `${this.apiUrl}/locations/${this.editingLocation.id}`,
        this.locationForm,
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          this.loadLocations();
          this.closeLocationModal();
          alert('Location updated successfully');
        },
        error: (err) => {
          alert('Failed to update location');
          console.error(err);
        }
      });
    } else {
      // Create new location
      this.createLocation(this.locationForm);
      this.closeLocationModal();
    }
  }

  createLocation(data: any): void {
    this.http.post(`${this.apiUrl}/locations`, data, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.loadLocations();
        alert('Location created successfully');
      },
      error: (err) => {
        alert('Failed to create location');
        console.error(err);
      }
    });
  }

  updateLocationStatus(locationId: string, status: string): void {
    const confirmMsg = status === 'closed' 
      ? 'Are you sure you want to close this location? This action may affect reporting.'
      : `Are you sure you want to ${status} this location?`;
      
    if (!confirm(confirmMsg)) return;
    
    this.http.put(
      `${this.apiUrl}/locations/${locationId}/status`,
      { status },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loadLocations();
        alert(`Location ${status} successfully`);
      },
      error: (err) => {
        alert('Failed to update location status');
        console.error(err);
      }
    });
  }
  
  deleteLocation(locationId: string): void {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }
    
    this.http.delete(
      `${this.apiUrl}/locations/${locationId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loadLocations();
        alert('Location deleted successfully');
      },
      error: (err) => {
        alert('Failed to delete location. It may have associated data.');
        console.error(err);
      }
    });
  }

  // User Management
  openUserModal(user: any = null): void {
    this.editingUser = user;
    if (user) {
      // Edit mode - populate form
      this.userForm = {
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password for security
        role: user.role || 'cashier',
        location_id: user.location_id || '',
        status: user.status || 'active'
      };
    } else {
      // Create mode - reset form
      this.userForm = {
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        location_id: '',
        status: 'active'
      };
    }
    this.showUserModal = true;
  }
  
  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
  }
  
  saveUser(): void {
    if (!this.userForm.name || !this.userForm.email) {
      alert('Please fill in required fields (Name and Email)');
      return;
    }
    
    if (!this.editingUser && !this.userForm.password) {
      alert('Password is required for new users');
      return;
    }
    
    if (this.editingUser) {
      // Update existing user
      const updateData: any = {
        name: this.userForm.name,
        email: this.userForm.email,
        role: this.userForm.role,
        location_id: this.userForm.location_id,
        status: this.userForm.status
      };
      
      // Only include password if provided
      if (this.userForm.password) {
        updateData.password_hash = this.userForm.password;
      }
      
      this.http.put(
        `${this.apiUrl}/owner/users/${this.editingUser.id}`,
        updateData,
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          this.loadUsers();
          this.closeUserModal();
          alert('User updated successfully');
        },
        error: (err) => {
          alert('Failed to update user');
          console.error(err);
        }
      });
    } else {
      // Create new user - include password_hash
      const createData = {
        name: this.userForm.name,
        email: this.userForm.email,
        password_hash: this.userForm.password,
        role: this.userForm.role,
        location_id: this.userForm.location_id,
        status: this.userForm.status
      };
      this.createUser(createData);
      this.closeUserModal();
    }
  }

  createUser(data: any): void {
    this.http.post(`${this.apiUrl}/owner/users`, data, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.loadUsers();
        alert('User created successfully');
      },
      error: (err) => {
        alert('Failed to create user');
        console.error(err);
      }
    });
  }

  updateUserStatus(userId: string, status: string): void {
    if (!confirm(`Are you sure you want to ${status} this user?`)) {
      return;
    }
    
    this.http.put(
      `${this.apiUrl}/owner/users/${userId}/status`,
      { status },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loadUsers();
        alert(`User ${status} successfully`);
      },
      error: (err) => {
        alert('Failed to update user status');
        console.error(err);
      }
    });
  }
  
  deleteUser(userId: string): void {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    this.http.delete(
      `${this.apiUrl}/owner/users/${userId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loadUsers();
        alert('User deleted successfully');
      },
      error: (err) => {
        alert('Failed to delete user');
        console.error(err);
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    const classes: any = {
      'owner': 'badge-owner',
      'admin': 'badge-admin',
      'manager': 'badge-manager',
      'cashier': 'badge-cashier'
    };
    return classes[role] || 'badge-default';
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'active': 'badge-success',
      'inactive': 'badge-warning',
      'suspended': 'badge-danger',
      'closed': 'badge-danger'
    };
    return classes[status] || 'badge-default';
  }
  
  getManagerName(managerId: string): string {
    if (!managerId) return 'Unassigned';
    const manager = this.users.find(u => u.id === managerId);
    return manager ? manager.name : 'Unknown';
  }
  
  getLocationName(locationId: string): string {
    if (!locationId) return 'All Locations';
    const location = this.locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown';
  }
  
  getEligibleManagers(): any[] {
    return this.users.filter(u => 
      (u.role === 'manager' || u.role === 'admin') && u.status === 'active'
    );
  }
}
