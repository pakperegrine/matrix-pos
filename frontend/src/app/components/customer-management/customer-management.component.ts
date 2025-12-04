import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Customer, CustomerStatistics } from '../../models/customer';
import { ToastService } from '../../services/toast.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:3000/api';
  
  // Location filtering
  selectedLocationId: string | null = null;

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  customerStats: CustomerStatistics | null = null;
  
  loading = false;
  savingCustomer = false;
  deletingCustomer = false;
  
  showModal = false;
  showStatsModal = false;
  isEditing = false;
  
  searchQuery = '';
  filterType = 'all';
  filterActive = 'all';
  
  currentPage = 1;
  pageSize = 10;
  
  customerForm: Customer = this.getEmptyCustomer();
  formErrors: { [key: string]: string } = {};

  customerTypes = [
    { value: 'regular', label: 'Regular' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'vip', label: 'VIP' }
  ];

  loyaltyTiers = [
    { value: 'bronze', label: 'Bronze', color: '#cd7f32', minPoints: 0 },
    { value: 'silver', label: 'Silver', color: '#c0c0c0', minPoints: 2000 },
    { value: 'gold', label: 'Gold', color: '#ffd700', minPoints: 5000 },
    { value: 'platinum', label: 'Platinum', color: '#e5e4e2', minPoints: 10000 }
  ];

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    // Subscribe to location changes
    this.locationService.selectedLocation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        this.selectedLocationId = location?.id || null;
        this.loadCustomers();
      });
    
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getEmptyCustomer(): Customer {
    return {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      customer_type: 'regular',
      credit_limit: 0,
      discount_percentage: 0,
      notes: '',
      is_active: 1
    };
  }

  loadCustomers(): void {
    this.loading = true;
    
    const params: any = { limit: 1000 };
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterType !== 'all') params.customer_type = this.filterType;
    if (this.filterActive !== 'all') params.is_active = this.filterActive === 'active' ? 1 : 0;
    if (this.selectedLocationId) params.location_id = this.selectedLocationId;

    this.http.get<any>(`${this.apiUrl}/customers`, { params, headers: this.getHeaders() })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.customers = response.customers || [];
          this.applyFilters();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading customers:', error);
          this.toastService.error('Failed to load customers', 'Error');
        }
      });
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers;
    this.currentPage = 1;
  }

  get paginatedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCustomers.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCustomers.length / this.pageSize);
  }

  openCreateModal(): void {
    this.customerForm = this.getEmptyCustomer();
    this.formErrors = {};
    this.isEditing = false;
    this.showModal = true;
  }

  openEditModal(customer: Customer): void {
    this.customerForm = { ...customer };
    this.formErrors = {};
    this.isEditing = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.customerForm = this.getEmptyCustomer();
    this.formErrors = {};
  }

  async viewCustomerStats(customer: Customer): Promise<void> {
    if (!customer.id) return;

    this.selectedCustomer = customer;
    this.showStatsModal = true;

    try {
      const stats = await this.http.get<CustomerStatistics>(
        `${this.apiUrl}/customers/${customer.id}/statistics`,
        { headers: this.getHeaders() }
      ).toPromise();
      this.customerStats = stats || null;
    } catch (error) {
      console.error('Error loading statistics:', error);
      this.toastService.error('Failed to load customer statistics', 'Error');
    }
  }

  closeStatsModal(): void {
    this.showStatsModal = false;
    this.selectedCustomer = null;
    this.customerStats = null;
  }

  validateCustomer(): boolean {
    this.formErrors = {};

    if (!this.customerForm.name || this.customerForm.name.trim() === '') {
      this.formErrors['name'] = 'Customer name is required';
    }

    if (this.customerForm.email && !this.isValidEmail(this.customerForm.email)) {
      this.formErrors['email'] = 'Invalid email format';
    }

    if (this.customerForm.phone && !this.isValidPhone(this.customerForm.phone)) {
      this.formErrors['phone'] = 'Invalid phone format';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  async saveCustomer(): Promise<void> {
    if (!this.validateCustomer()) {
      this.toastService.warning('Please fix validation errors', 'Validation Error');
      return;
    }

    this.savingCustomer = true;

    const payload = this.prepareCustomerData();

    try {
      if (this.isEditing && this.customerForm.id) {
        await this.http.put(`${this.apiUrl}/customers/${this.customerForm.id}`, payload, { headers: this.getHeaders() })
          .pipe(finalize(() => this.savingCustomer = false))
          .toPromise();
        this.toastService.success('Customer updated successfully', 'Success');
      } else {
        await this.http.post(`${this.apiUrl}/customers`, payload, { headers: this.getHeaders() })
          .pipe(finalize(() => this.savingCustomer = false))
          .toPromise();
        this.toastService.success('Customer created successfully', 'Success');
      }

      this.closeModal();
      this.loadCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      const message = error.error?.message || 'Failed to save customer';
      this.toastService.error(message, 'Error');
    }
  }

  prepareCustomerData(): Partial<Customer> {
    const data: Partial<Customer> = {
      name: this.customerForm.name,
      email: this.customerForm.email || undefined,
      phone: this.customerForm.phone || undefined,
      address: this.customerForm.address || undefined,
      city: this.customerForm.city || undefined,
      country: this.customerForm.country || undefined,
      postal_code: this.customerForm.postal_code || undefined,
      customer_type: this.customerForm.customer_type,
      credit_limit: Number(this.customerForm.credit_limit) || 0,
      discount_percentage: Number(this.customerForm.discount_percentage) || 0,
      notes: this.customerForm.notes || undefined,
      is_active: this.customerForm.is_active ? 1 : 0
    };

    if (this.customerForm.date_of_birth) {
      data.date_of_birth = this.customerForm.date_of_birth;
    }

    return data;
  }

  async deleteCustomer(customer: Customer): Promise<void> {
    if (!customer.id) return;

    const confirmed = confirm(
      `Are you sure you want to delete customer "${customer.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    this.deletingCustomer = true;

    try {
      await this.http.delete(`${this.apiUrl}/customers/${customer.id}`, { headers: this.getHeaders() })
        .pipe(finalize(() => this.deletingCustomer = false))
        .toPromise();

      this.toastService.success('Customer deleted successfully', 'Success');
      this.loadCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      const message = error.error?.message || 'Failed to delete customer';
      this.toastService.error(message, 'Error');
    }
  }

  getLoyaltyTierInfo(tier: string) {
    return this.loyaltyTiers.find(t => t.value === tier) || this.loyaltyTiers[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onSearchChange(): void {
    this.loadCustomers();
  }

  onFilterChange(): void {
    this.loadCustomers();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
