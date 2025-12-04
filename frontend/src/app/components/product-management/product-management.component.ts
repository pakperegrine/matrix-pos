import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { TableColumn, TableData } from '../shared/table/table.component';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { LocationService } from '../../services/location.service';

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
  is_active: number;
  scope?: string;
  location_id?: string;
}

@Component({
  selector: 'app-product-management',
  standalone: false,
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private apiUrl = 'http://localhost:3000/api';
  
  // Location filtering
  selectedLocationId: string | null = null;

  columns: TableColumn[] = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'price', label: 'Sale Price', sortable: true },
    { key: 'cost', label: 'Cost', sortable: true },
    { key: 'category_id', label: 'Category', sortable: true },
    { key: 'unit_id', label: 'Unit', sortable: true },
    { key: 'is_active', label: 'Status', sortable: true }
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

  // ✅ CATEGORIES
  categories = [
    { id: '', name: '-- Select Category --' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'food', name: 'Food' },
    { id: 'clothing', name: 'Clothing' }
  ];

  // ✅ UNITS
  units = [
    { id: '', name: '-- Select Unit --' },
    { id: 'pcs', name: 'Pieces' },
    { id: 'kg', name: 'KG' },
    { id: 'box', name: 'Box' }
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
        this.loadProducts();
      });
    
    this.loadProducts();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ✅ LOAD PRODUCTS
  loadProducts(page: number = 1): void {
    this.loading = true;
    
    const params: any = {};
    if (this.selectedLocationId) {
      params.location_id = this.selectedLocationId;
    }

    this.http.get<Product[]>(`${this.apiUrl}/products`, { params, headers: this.getHeaders() })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (products) => {
          this.allProducts = products || [];
          this.tableData.data = this.allProducts;
          this.tableData.total = this.allProducts.length;
        },
        error: () => {
          this.toastService.error('Failed to load products');
        }
      });
  }

  // ✅ OPEN CREATE MODAL (FIXED)
  openCreateModal(): void {
    this.isEditMode = false;
    this.formErrors = {};
    this.currentProduct = {
      name: '',
      sku: '',
      barcode: '',
      price: 0,
      cost: 0,
      category_id: '',
      unit_id: 'pcs',
      track_inventory: true,
      allow_negative_stock: false,
      is_active: 1,
      scope: 'central'
    };
    this.showProductModal = true;
  }

  // ✅ OPEN EDIT MODAL
  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.showProductModal = true;
  }

  closeProductModal(): void {
    if (this.savingProduct) return;
    this.showProductModal = false;
    this.currentProduct = {};
  }

  // ✅ VALIDATION
  private validateProduct(): boolean {
    this.formErrors = {};
    let valid = true;

    if (!this.currentProduct.name || this.currentProduct.name.trim() === '') {
      this.formErrors['name'] = 'Product name is required';
      valid = false;
    }

    if (this.currentProduct.price === undefined || this.currentProduct.price < 0) {
      this.formErrors['price'] = 'Valid price required';
      valid = false;
    }

    return valid;
  }

  // ✅ CREATE / UPDATE PRODUCT (MAIN FIX ✅✅✅)
  saveProduct(): void {
    if (!this.validateProduct()) return;

    this.savingProduct = true;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const locationId = localStorage.getItem('selectedLocationId') || user.location_id;

    const productData = {
      name: this.currentProduct.name,
      sku: this.currentProduct.sku,
      barcode: this.currentProduct.barcode,
      price: Number(this.currentProduct.price),
      cost: Number(this.currentProduct.cost),
      category_id: this.currentProduct.category_id,
      unit_id: this.currentProduct.unit_id,
      track_inventory: this.currentProduct.track_inventory,
      allow_negative_stock: this.currentProduct.allow_negative_stock,
      is_active: this.currentProduct.is_active,
      scope: this.currentProduct.scope,
      location_id: locationId || undefined
    };

    const request$ = this.isEditMode
      ? this.http.put(`${this.apiUrl}/products/${this.currentProduct.id}`, productData, { headers: this.getHeaders() })
      : this.http.post(`${this.apiUrl}/products`, productData, { headers: this.getHeaders() });

    request$
      .pipe(finalize(() => this.savingProduct = false))
      .subscribe({
        next: () => {
          this.toastService.success(`Product ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.closeProductModal();
          this.loadProducts();
        },
        error: () => {
          this.toastService.error('Failed to save product');
        }
      });
  }

  // ✅ DELETE PRODUCT
  deleteProduct(): void {
    if (!this.currentProduct.id) return;

    this.deletingProduct = true;

    this.http.delete(`${this.apiUrl}/products/${this.currentProduct.id}`, { headers: this.getHeaders() })
      .pipe(finalize(() => this.deletingProduct = false))
      .subscribe({
        next: () => {
          this.toastService.success('Product deleted');
          this.closeProductModal();
          this.loadProducts();
        },
        error: () => {
          this.toastService.error('Failed to delete product');
        }
      });
  }

  // ✅ ROW CLICK
  // The table emits an array of selected rows; accept either a single product or an array
  onRowSelect(selection: Product | Product[]): void {
    const product = Array.isArray(selection) ? (selection.length ? selection[0] : null) : selection;
    if (!product) return;
    this.openEditModal(product);
  }

  onPageChange(page: number): void {}
  onSort(event: any): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
