import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { TableColumn, TableData } from '../shared/table/table.component';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  category_id?: string;
  unit_id?: string;
  track_inventory: boolean;
  allow_negative_stock?: boolean;
  is_active: number; // Backend uses tinyint (0/1)
  scope?: string;
  location_id?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:3000/api';
  
  columns: TableColumn[] = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { 
      key: 'price', 
      label: 'Sale Price', 
      sortable: true,
      formatter: (val) => val ? `$${Number(val).toFixed(2)}` : '$0.00'
    },
    { 
      key: 'cost', 
      label: 'Cost', 
      sortable: true,
      formatter: (val) => val ? `$${Number(val).toFixed(2)}` : '$0.00'
    },
    { 
      key: 'category_id', 
      label: 'Category', 
      sortable: true,
      formatter: (val) => this.getCategoryName(val)
    },
    { 
      key: 'unit_id', 
      label: 'Unit', 
      sortable: true,
      formatter: (val) => this.getUnitName(val)
    },
    { 
      key: 'track_inventory', 
      label: 'Inventory',
      formatter: (val) => val ? 'Tracked' : 'Not Tracked'
    },
    { 
      key: 'is_active', 
      label: 'Status',
      formatter: (val) => val === 1 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-inactive">Inactive</span>'
    }
  ];

  tableData: TableData = {
    data: [],
    page: 1,
    perPage: 25,
    total: 0
  };

  loading = false;
  showProductModal = false;
  isEditMode = false;
  savingProduct = false;
  deletingProduct = false;
  currentProduct: Partial<Product> = {};
  formErrors: { [key: string]: string } = {};
  allProducts: Product[] = [];

  // Dropdown options
  categories = [
    { id: '', name: '-- Select Category --' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'food', name: 'Food & Beverage' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'office', name: 'Office Supplies' },
    { id: 'health', name: 'Health & Beauty' },
    { id: 'books', name: 'Books & Media' },
    { id: 'sports', name: 'Sports & Outdoors' },
    { id: 'toys', name: 'Toys & Games' },
    { id: 'automotive', name: 'Automotive' },
    { id: 'other', name: 'Other' }
  ];

  units = [
    { id: '', name: '-- Select Unit --' },
    { id: 'pcs', name: 'Pieces (pcs)' },
    { id: 'kg', name: 'Kilograms (kg)' },
    { id: 'g', name: 'Grams (g)' },
    { id: 'lbs', name: 'Pounds (lbs)' },
    { id: 'oz', name: 'Ounces (oz)' },
    { id: 'l', name: 'Liters (L)' },
    { id: 'ml', name: 'Milliliters (mL)' },
    { id: 'box', name: 'Box' },
    { id: 'pack', name: 'Pack' },
    { id: 'dozen', name: 'Dozen' },
    { id: 'case', name: 'Case' },
    { id: 'm', name: 'Meters (m)' },
    { id: 'ft', name: 'Feet (ft)' },
    { id: 'sqm', name: 'Square Meters (sqm)' },
    { id: 'sqft', name: 'Square Feet (sqft)' }
  ];

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.loading = true;
    
    this.http.get<Product[]>(`${this.apiUrl}/products`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (products) => {
          this.allProducts = products || [];
          this.paginateProducts(page);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to load products:', error);
          const message = error.error?.message || 'Failed to load products. Please try again.';
          this.toastService.error(message, 'Load Error');
          this.tableData.data = [];
          this.tableData.total = 0;
        }
      });
  }

  private paginateProducts(page: number): void {
    const startIdx = (page - 1) * this.tableData.perPage;
    const endIdx = startIdx + this.tableData.perPage;
    
    this.tableData = {
      data: this.allProducts.slice(startIdx, endIdx),
      page,
      perPage: this.tableData.perPage,
      total: this.allProducts.length
    };
  }

  getCategoryName(categoryId: string): string {
    if (!categoryId) return '-';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  getUnitName(unitId: string): string {
    if (!unitId) return '-';
    const unit = this.units.find(u => u.id === unitId);
    return unit ? unit.name : unitId;
  }

  onPageChange(page: number): void {
    this.loadProducts(page);
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    // Sort data locally
    const sortedData = [...this.tableData.data].sort((a, b) => {
      const aVal = a[event.column];
      const bVal = b[event.column];
      
      if (aVal < bVal) return event.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.tableData = { ...this.tableData, data: sortedData };
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.formErrors = {};
    this.currentProduct = {
      name: '',
      sku: '',
      barcode: '',
      price: undefined,
      cost: undefined,
      category_id: '',
      unit_id: 'pcs',
      track_inventory: true,
      allow_negative_stock: false,
      is_active: 1,
      scope: 'central'
    };
    this.showProductModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.formErrors = {};
    this.currentProduct = { 
      ...product,
      price: product.price || 0,
      cost: product.cost || 0
    };
    this.showProductModal = true;
  }

  closeProductModal(): void {
    if (this.savingProduct) return;
    this.showProductModal = false;
    this.currentProduct = {};
    this.formErrors = {};
  }

  private validateProduct(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.currentProduct.name || this.currentProduct.name.trim() === '') {
      this.formErrors['name'] = 'Product name is required';
      isValid = false;
    }

    if (this.currentProduct.price === undefined || this.currentProduct.price === null) {
      this.formErrors['price'] = 'Sale price is required';
      isValid = false;
    } else if (this.currentProduct.price < 0) {
      this.formErrors['price'] = 'Sale price must be positive';
      isValid = false;
    }

    if (this.currentProduct.cost !== undefined && this.currentProduct.cost < 0) {
      this.formErrors['cost'] = 'Cost price must be positive';
      isValid = false;
    }

    if (!isValid) {
      this.toastService.warning('Please fix validation errors', 'Validation Error');
    }

    return isValid;
  }

  saveProduct(): void {
    if (!this.validateProduct()) {
      return;
    }

    this.savingProduct = true;
    const productData = this.prepareProductData();

    const request$ = this.isEditMode && this.currentProduct.id
      ? this.http.put(`${this.apiUrl}/products/${this.currentProduct.id}`, productData)
      : this.http.post(`${this.apiUrl}/products`, productData);

    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.savingProduct = false)
      )
      .subscribe({
        next: () => {
          const action = this.isEditMode ? 'updated' : 'created';
          this.toastService.success(`Product ${action} successfully`, 'Success');
          this.closeProductModal();
          this.loadProducts(this.tableData.page);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to save product:', error);
          const message = error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} product`;
          this.toastService.error(message, 'Save Error');
        }
      });
  }

  private prepareProductData(): Partial<Product> {
    return {
      name: this.currentProduct.name?.trim(),
      sku: this.currentProduct.sku?.trim() || undefined,
      barcode: this.currentProduct.barcode?.trim() || undefined,
      price: Number(this.currentProduct.price) || 0,
      cost: this.currentProduct.cost ? Number(this.currentProduct.cost) : 0,
      category_id: this.currentProduct.category_id || undefined,
      unit_id: this.currentProduct.unit_id || 'pcs',
      track_inventory: !!this.currentProduct.track_inventory,
      allow_negative_stock: !!this.currentProduct.allow_negative_stock,
      is_active: this.currentProduct.is_active === 1 ? 1 : 0,
      scope: this.currentProduct.scope || 'central',
      location_id: this.currentProduct.location_id || undefined
    };
  }

  deleteProduct(): void {
    if (!this.currentProduct.id) return;

    const productName = this.currentProduct.name || 'this product';
    if (!confirm(`Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    this.deletingProduct = true;

    this.http.delete(`${this.apiUrl}/products/${this.currentProduct.id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.deletingProduct = false)
      )
      .subscribe({
        next: () => {
          this.toastService.success('Product deleted successfully', 'Success');
          this.closeProductModal();
          
          // Reload current page, or previous page if current is now empty
          const currentPage = this.tableData.page;
          const totalAfterDelete = this.tableData.total - 1;
          const maxPage = Math.ceil(totalAfterDelete / this.tableData.perPage) || 1;
          const pageToLoad = currentPage > maxPage ? maxPage : currentPage;
          
          this.loadProducts(pageToLoad);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to delete product:', error);
          const message = error.error?.message || 'Failed to delete product';
          this.toastService.error(message, 'Delete Error');
        }
      });
  }

  onRowSelect(product: Product): void {
    this.openEditModal(product);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
