import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, fromEvent, merge, of, interval } from 'rxjs';
import { map, distinctUntilChanged, catchError, switchMap, tap } from 'rxjs/operators';
import { DexieService } from './dexie.service';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  lastError: string | null;
}

export interface PendingSale {
  id?: number;
  temp_invoice_no: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  created_at: Date;
  sync_status: 'pending' | 'syncing' | 'failed' | 'success';
  sync_error?: string;
  retry_count: number;
  items: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private apiUrl = 'http://localhost:3000/api';
  
  // Sync status observable
  private syncStatusSubject = new BehaviorSubject<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    lastError: null
  });
  
  public syncStatus$: Observable<SyncStatus> = this.syncStatusSubject.asObservable();
  
  // Online/offline detection
  private online$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private dexieService: DexieService
  ) {
    // Setup online/offline detection
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(distinctUntilChanged());

    // Subscribe to online status changes
    this.online$.subscribe(isOnline => {
      this.updateSyncStatus({ isOnline });
      
      // Auto-sync when coming back online
      if (isOnline) {
        this.syncPendingSales();
      }
    });

    // Check pending count on initialization
    this.updatePendingCount();

    // Periodic sync check (every 30 seconds when online)
    interval(30000).pipe(
      switchMap(() => this.syncStatus$)
    ).subscribe(status => {
      if (status.isOnline && !status.isSyncing && status.pendingCount > 0) {
        this.syncPendingSales();
      }
    });
  }

  /**
   * Get current online status
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get current sync status
   */
  getCurrentStatus(): SyncStatus {
    return this.syncStatusSubject.value;
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(partial: Partial<SyncStatus>): void {
    const current = this.syncStatusSubject.value;
    this.syncStatusSubject.next({ ...current, ...partial });
  }

  /**
   * Update pending transaction count
   */
  private async updatePendingCount(): Promise<void> {
    try {
      const db = await this.dexieService.getDatabase();
      const pending = await db.offline_sales
        .where('sync_status')
        .equals('pending')
        .count();
      
      this.updateSyncStatus({ pendingCount: pending });
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }

  /**
   * Get all pending sales
   */
  async getPendingSales(): Promise<PendingSale[]> {
    try {
      const db = await this.dexieService.getDatabase();
      const sales = await db.offline_sales
        .where('sync_status')
        .anyOf(['pending', 'failed'])
        .reverse()
        .sortBy('created_at');
      
      return sales;
    } catch (error) {
      console.error('Error fetching pending sales:', error);
      return [];
    }
  }

  /**
   * Save offline sale
   */
  async saveOfflineSale(sale: any): Promise<void> {
    try {
      const db = await this.dexieService.getDatabase();
      
      const offlineSale: PendingSale = {
        temp_invoice_no: sale.temp_invoice_no || `TEMP-${Date.now()}`,
        customer_name: sale.customer_name || 'Walk-in Customer',
        total_amount: sale.total_amount,
        payment_method: sale.payment_method,
        created_at: new Date(),
        sync_status: 'pending',
        retry_count: 0,
        items: sale.items || []
      };

      await db.offline_sales.add(offlineSale);
      await this.updatePendingCount();
      
      // Try to sync immediately if online
      if (this.isOnline()) {
        this.syncPendingSales();
      }
    } catch (error) {
      console.error('Error saving offline sale:', error);
      throw error;
    }
  }

  /**
   * Sync all pending sales to backend
   */
  async syncPendingSales(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline()) {
      console.warn('Cannot sync: device is offline');
      return { success: 0, failed: 0 };
    }

    const current = this.getCurrentStatus();
    if (current.isSyncing) {
      console.warn('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    this.updateSyncStatus({ isSyncing: true, lastError: null });

    try {
      const pendingSales = await this.getPendingSales();
      
      if (pendingSales.length === 0) {
        this.updateSyncStatus({ 
          isSyncing: false, 
          lastSyncTime: new Date(),
          pendingCount: 0
        });
        return { success: 0, failed: 0 };
      }

      let successCount = 0;
      let failedCount = 0;

      // Sync each sale
      for (const sale of pendingSales) {
        try {
          await this.syncSingleSale(sale);
          successCount++;
        } catch (error) {
          failedCount++;
          await this.markSaleFailed(sale, error);
        }
      }

      await this.updatePendingCount();

      this.updateSyncStatus({ 
        isSyncing: false, 
        lastSyncTime: new Date(),
        lastError: failedCount > 0 ? `${failedCount} sales failed to sync` : null
      });

      return { success: successCount, failed: failedCount };

    } catch (error) {
      console.error('Error during sync:', error);
      this.updateSyncStatus({ 
        isSyncing: false,
        lastError: error instanceof Error ? error.message : 'Sync failed'
      });
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Sync a single sale
   */
  private async syncSingleSale(sale: PendingSale): Promise<void> {
    const db = await this.dexieService.getDatabase();

    // Update status to syncing
    if (sale.id) {
      await db.offline_sales.update(sale.id, { 
        sync_status: 'syncing' as const
      });
    }

    // Prepare payload for backend
    const payload = {
      temp_invoice_no: sale.temp_invoice_no,
      customer_name: sale.customer_name,
      total_amount: sale.total_amount,
      payment_method: sale.payment_method,
      items: sale.items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    try {
      // Call backend sync endpoint
      const token = localStorage.getItem('auth_token');
      const headers: { [key: string]: string } = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await this.http.post(`${this.apiUrl}/sync/offline-sale`, payload, { headers })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            throw error;
          })
        )
        .toPromise();

      // Mark as synced and remove from IndexedDB
      if (sale.id) {
        await db.offline_sales.delete(sale.id);
      }

    } catch (error) {
      // Update retry count and status
      if (sale.id) {
        await db.offline_sales.update(sale.id, {
          sync_status: 'failed' as const,
          retry_count: (sale.retry_count || 0) + 1,
          sync_error: error instanceof HttpErrorResponse 
            ? `HTTP ${error.status}: ${error.message}` 
            : error instanceof Error 
              ? error.message 
              : 'Unknown error'
        });
      }
      throw error;
    }
  }

  /**
   * Mark sale as failed
   */
  private async markSaleFailed(sale: PendingSale, error: any): Promise<void> {
    try {
      const db = await this.dexieService.getDatabase();
      if (sale.id) {
        await db.offline_sales.update(sale.id, {
          sync_status: 'failed' as const,
          retry_count: (sale.retry_count || 0) + 1,
          sync_error: error instanceof HttpErrorResponse 
            ? `HTTP ${error.status}: ${error.message}` 
            : error instanceof Error 
              ? error.message 
              : 'Unknown error'
        });
      }
    } catch (err) {
      console.error('Error marking sale as failed:', err);
    }
  }

  /**
   * Retry syncing a specific sale
   */
  async retrySale(saleId: number): Promise<boolean> {
    if (!this.isOnline()) {
      throw new Error('Cannot retry: device is offline');
    }

    try {
      const db = await this.dexieService.getDatabase();
      const sale = await db.offline_sales.get(saleId);
      
      if (!sale) {
        throw new Error('Sale not found');
      }

      await this.syncSingleSale(sale);
      await this.updatePendingCount();
      
      return true;
    } catch (error) {
      console.error('Error retrying sale:', error);
      throw error;
    }
  }

  /**
   * Delete a pending sale (manual removal)
   */
  async deletePendingSale(saleId: number): Promise<void> {
    try {
      const db = await this.dexieService.getDatabase();
      await db.offline_sales.delete(saleId);
      await this.updatePendingCount();
    } catch (error) {
      console.error('Error deleting pending sale:', error);
      throw error;
    }
  }

  /**
   * Clear all successfully synced sales
   */
  async clearSyncedSales(): Promise<void> {
    try {
      const db = await this.dexieService.getDatabase();
      await db.offline_sales
        .where('sync_status')
        .equals('success')
        .delete();
      
      await this.updatePendingCount();
    } catch (error) {
      console.error('Error clearing synced sales:', error);
      throw error;
    }
  }

  /**
   * Test backend connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.http.get(`${this.apiUrl}/products`, { 
        params: { limit: '1' }
      }).toPromise();
      return true;
    } catch {
      return false;
    }
  }
}
