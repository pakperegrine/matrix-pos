import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { TableColumn, TableData } from '../shared/table/table.component';

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  cost?: number;
  category?: string;
  unit_of_measure?: string;
  track_inventory: boolean;
  is_active: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  private apiUrl = 'http://localhost:3000/api';
  
  columns: TableColumn[] = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { 
      key: 'price', 
      label: 'Price', 
      sortable: true,
      formatter: (val) => `$${val?.toFixed(2) || '0.00'}`
    },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'unit_of_measure', label: 'Unit', sortable: true },
    { 
      key: 'is_active', 
      label: 'Status',
      formatter: (val) => val ? '✓ Active' : '✗ Inactive'
    }
  ];

  tableData: TableData = {
    data: [],
    page: 1,
    perPage: 25,
    total: 0
  };

  loading: boolean = false;
  showProductModal: boolean = false;
  isEditMode: boolean = false;
  currentProduct: Partial<Product> = {};

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(page: number = 1): Promise<void> {
    this.loading = true;
    try {
      // For now, since backend doesn't have pagination, we'll simulate it
      const response = await this.http.get<Product[]>(`${this.apiUrl}/products`).toPromise();
      
      const allProducts = response || [];
      const startIdx = (page - 1) * this.tableData.perPage;
      const endIdx = startIdx + this.tableData.perPage;
      
      this.tableData = {
        data: allProducts.slice(startIdx, endIdx),
        page,
        perPage: this.tableData.perPage,
        total: allProducts.length
      };
    } catch (error) {
      console.error('Failed to load products', error);
      this.toastService.error('Failed to load products', 'Error');
      this.tableData.data = [];
    } finally {
      this.loading = false;
    }
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
    this.currentProduct = {
      name: '',
      sku: '',
      price: 0,
      cost: 0,
      category: '',
      unit_of_measure: 'pcs',
      track_inventory: true,
      is_active: true
    };
    this.showProductModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.currentProduct = {};
  }

  async saveProduct(): Promise<void> {
    if (!this.currentProduct.name || this.currentProduct.price === undefined) {
      this.toastService.warning('Please fill in required fields', 'Validation Error');
      return;
    }

    this.loading = true;
    try {
      if (this.isEditMode && this.currentProduct.id) {
        // Update existing product
        await this.http.put(
          `${this.apiUrl}/products/${this.currentProduct.id}`,
          this.currentProduct
        ).toPromise();
        
        this.toastService.success('Product updated successfully');
      } else {
        // Create new product
        await this.http.post(
          `${this.apiUrl}/products`,
          this.currentProduct
        ).toPromise();
        
        this.toastService.success('Product created successfully');
      }
      
      this.closeProductModal();
      await this.loadProducts(this.tableData.page);
    } catch (error) {
      console.error('Failed to save product', error);
      this.toastService.error('Failed to save product', 'Error');
    } finally {
      this.loading = false;
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    this.loading = true;
    try {
      await this.http.delete(`${this.apiUrl}/products/${product.id}`).toPromise();
      this.toastService.success('Product deleted successfully');
      await this.loadProducts(this.tableData.page);
    } catch (error) {
      console.error('Failed to delete product', error);
      this.toastService.error('Failed to delete product', 'Error');
    } finally {
      this.loading = false;
    }
  }

  onRowSelect(product: Product): void {
    this.openEditModal(product);
  }
}
