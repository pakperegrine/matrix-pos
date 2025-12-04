import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Discount, BulkTier } from '../../models/discount';
import { LocationService } from '../../services/location.service';
import { ToastService } from '../../services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-discount-management',
  standalone: false,
  templateUrl: './discount-management.component.html',
  styleUrls: ['./discount-management.component.scss']
})
export class DiscountManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  discounts: Discount[] = [];
  filteredDiscounts: Discount[] = [];
  paginatedDiscounts: Discount[] = [];
  
  // Location filtering
  selectedLocationId: string | null = null;
  
  // Filters
  searchTerm: string = '';
  filterType: string = '';
  filterStatus: string = '';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  
  // Modal state
  showModal: boolean = false;
  editMode: boolean = false;
  currentDiscount: Partial<Discount> = {};
  
  // Form data
  discountTypes = [
    { value: 'percentage', label: 'Percentage Off' },
    { value: 'fixed_amount', label: 'Fixed Amount Off' },
    { value: 'buy_x_get_y', label: 'Buy X Get Y' },
    { value: 'bulk_discount', label: 'Bulk Discount' }
  ];
  
  appliesTo = [
    { value: 'all_products', label: 'All Products' },
    { value: 'specific_products', label: 'Specific Products' },
    { value: 'categories', label: 'Categories' },
    { value: 'customers', label: 'Customers' }
  ];
  
  applicationMethods = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
    { value: 'coupon_code', label: 'Coupon Code' }
  ];
  
  // Bulk tier management
  bulkTiers: BulkTier[] = [];
  newTierQty: number = 0;
  newTierDiscount: number = 0;

  private apiUrl = `${environment.apiUrl}/discounts`;

  constructor(
    private http: HttpClient,
    private locationService: LocationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Subscribe to location changes
    this.locationService.selectedLocation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(location => {
        this.selectedLocationId = location?.id || null;
        this.loadDiscounts();
      });
    
    this.loadDiscounts();
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

  loadDiscounts(): void {
    const params: any = {};
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }
    
    this.http.get<{ discounts: Discount[]; total: number }>(this.apiUrl, { params, headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.discounts = response.discounts;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading discounts:', error);
          const errorMessage = error.error?.message || 'Failed to load discounts';
          this.toastService.error(errorMessage, 'Error');
        }
      });
  }

  applyFilters(): void {
    this.filteredDiscounts = this.discounts.filter(discount => {
      const matchesSearch = !this.searchTerm || 
        discount.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (discount.code && discount.code.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesType = !this.filterType || discount.discount_type === this.filterType;
      const matchesStatus = !this.filterStatus || 
        (this.filterStatus === 'active' && discount.is_active) ||
        (this.filterStatus === 'inactive' && !discount.is_active);
      
      return matchesSearch && matchesType && matchesStatus;
    });
    
    this.totalPages = Math.ceil(this.filteredDiscounts.length / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDiscounts = this.filteredDiscounts.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  openCreateModal(): void {
    this.editMode = false;
    this.currentDiscount = {
      name: '',
      discount_type: 'percentage',
      discount_value: 0,
      applies_to: 'all_products',
      minimum_purchase: 0,
      minimum_quantity: 0,
      application_method: 'manual',
      priority: 0,
      can_combine: true,
      is_active: true,
      current_uses: 0
    };
    this.bulkTiers = [];
    this.showModal = true;
  }

  openEditModal(discount: Discount): void {
    this.editMode = true;
    this.currentDiscount = { ...discount };
    
    // Parse bulk tiers if exists
    if (discount.bulk_tiers) {
      this.bulkTiers = Array.isArray(discount.bulk_tiers) 
        ? [...discount.bulk_tiers]
        : JSON.parse(discount.bulk_tiers as any);
    } else {
      this.bulkTiers = [];
    }
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentDiscount = {};
    this.bulkTiers = [];
  }

  saveDiscount(): void {
    // Prepare discount data
    const discountData = { ...this.currentDiscount };
    
    // Add location_id if creating new discount
    if (!this.editMode) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const locationId = localStorage.getItem('selectedLocationId') || user.location_id;
      if (locationId) {
        discountData.location_id = locationId;
      }
    }
    
    // Add bulk tiers if bulk discount
    if (discountData.discount_type === 'bulk_discount') {
      discountData.bulk_tiers = this.bulkTiers;
    }
    
    if (this.editMode && discountData.id) {
      this.http.put<Discount>(`${this.apiUrl}/${discountData.id}`, discountData, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.toastService.success('Discount updated successfully', 'Success');
            this.loadDiscounts();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating discount:', error);
            const errorMessage = error.error?.message || 'Failed to update discount';
            this.toastService.error(errorMessage, 'Error');
          }
        });
    } else {
      this.http.post<Discount>(this.apiUrl, discountData, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.toastService.success('Discount created successfully', 'Success');
            this.loadDiscounts();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating discount:', error);
            const errorMessage = error.error?.message || 'Failed to create discount';
            this.toastService.error(errorMessage, 'Error');
          }
        });
    }
  }

  deleteDiscount(id: string): void {
    if (confirm('Are you sure you want to delete this discount?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.toastService.success('Discount deleted successfully', 'Success');
            this.loadDiscounts();
          },
          error: (error) => {
            console.error('Error deleting discount:', error);
            const errorMessage = error.error?.message || 'Failed to delete discount';
            this.toastService.error(errorMessage, 'Error');
          }
        });
    }
  }

  toggleStatus(discount: Discount): void {
    const updatedDiscount = { ...discount, is_active: !discount.is_active };
    const action = updatedDiscount.is_active ? 'activated' : 'deactivated';
    this.http.put(`${this.apiUrl}/${discount.id}`, updatedDiscount, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.toastService.success(`Discount ${action} successfully`, 'Success');
          this.loadDiscounts();
        },
        error: (error) => {
          console.error('Error toggling status:', error);
          const errorMessage = error.error?.message || 'Failed to update discount status';
          this.toastService.error(errorMessage, 'Error');
        }
      });
  }

  // Bulk tier management
  addBulkTier(): void {
    if (this.newTierQty > 0 && this.newTierDiscount > 0) {
      this.bulkTiers.push({
        quantity: this.newTierQty,
        discount: this.newTierDiscount
      });
      this.bulkTiers.sort((a, b) => a.quantity - b.quantity);
      this.newTierQty = 0;
      this.newTierDiscount = 0;
    }
  }

  removeBulkTier(index: number): void {
    this.bulkTiers.splice(index, 1);
  }

  getDiscountTypeBadge(type: string): string {
    const badges: { [key: string]: string } = {
      'percentage': 'badge-primary',
      'fixed_amount': 'badge-success',
      'buy_x_get_y': 'badge-warning',
      'bulk_discount': 'badge-info'
    };
    return badges[type] || 'badge-secondary';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  }

  getUsagePercentage(discount: Discount): number {
    if (!discount.maximum_uses) return 0;
    return Math.round((discount.current_uses / discount.maximum_uses) * 100);
  }

  isExpired(discount: Discount): boolean {
    if (!discount.valid_until) return false;
    return new Date(discount.valid_until) < new Date();
  }

  isNotStarted(discount: Discount): boolean {
    if (!discount.valid_from) return false;
    return new Date(discount.valid_from) > new Date();
  }
}
