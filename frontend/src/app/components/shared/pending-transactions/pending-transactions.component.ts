import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { SyncService, PendingSale } from '../../../services/sync.service';

@Component({
  selector: 'app-pending-transactions',
  templateUrl: './pending-transactions.component.html',
  styleUrls: ['./pending-transactions.component.scss']
})
export class PendingTransactionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  pendingSales: PendingSale[] = [];
  loading = false;
  retryingIds = new Set<number>();
  deletingIds = new Set<number>();

  constructor(private syncService: SyncService) {}

  ngOnInit(): void {
    this.loadPendingSales();

    // Refresh pending sales every 5 seconds
    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.loadPendingSalesAsync())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load pending sales from IndexedDB
   */
  async loadPendingSales(): Promise<void> {
    this.loading = true;
    try {
      this.pendingSales = await this.syncService.getPendingSales();
    } catch (error) {
      console.error('Error loading pending sales:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load pending sales (async for interval)
   */
  private async loadPendingSalesAsync(): Promise<void> {
    try {
      this.pendingSales = await this.syncService.getPendingSales();
    } catch (error) {
      console.error('Error loading pending sales:', error);
    }
  }

  /**
   * Retry syncing a specific sale
   */
  async retrySale(sale: PendingSale): Promise<void> {
    if (!sale.id || this.retryingIds.has(sale.id)) {
      return;
    }

    this.retryingIds.add(sale.id);

    try {
      await this.syncService.retrySale(sale.id);
      await this.loadPendingSales();
    } catch (error) {
      console.error('Error retrying sale:', error);
      alert('Failed to sync transaction. Please try again.');
    } finally {
      if (sale.id) {
        this.retryingIds.delete(sale.id);
      }
    }
  }

  /**
   * Delete a pending sale
   */
  async deleteSale(sale: PendingSale): Promise<void> {
    if (!sale.id || this.deletingIds.has(sale.id)) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete this pending transaction?\n\n` +
      `Invoice: ${sale.temp_invoice_no}\n` +
      `Customer: ${sale.customer_name}\n` +
      `Amount: $${sale.total_amount.toFixed(2)}\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.deletingIds.add(sale.id);

    try {
      await this.syncService.deletePendingSale(sale.id);
      await this.loadPendingSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Failed to delete transaction.');
    } finally {
      if (sale.id) {
        this.deletingIds.delete(sale.id);
      }
    }
  }

  /**
   * Sync all pending sales
   */
  async syncAll(): Promise<void> {
    this.loading = true;
    try {
      const result = await this.syncService.syncPendingSales();
      await this.loadPendingSales();
      
      if (result.success > 0 || result.failed > 0) {
        alert(`Sync completed:\n✅ Success: ${result.success}\n❌ Failed: ${result.failed}`);
      }
    } catch (error) {
      console.error('Error syncing all:', error);
      alert('Sync failed. Please check your connection and try again.');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'syncing':
        return 'badge-syncing';
      case 'failed':
        return 'badge-failed';
      case 'success':
        return 'badge-success';
      default:
        return '';
    }
  }

  /**
   * Get status text
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'syncing':
        return 'Syncing...';
      case 'failed':
        return 'Failed';
      case 'success':
        return 'Success';
      default:
        return status;
    }
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if retry button should be disabled
   */
  isRetryDisabled(sale: PendingSale): boolean {
    return !sale.id || 
           this.retryingIds.has(sale.id) || 
           !this.syncService.isOnline() ||
           sale.sync_status === 'syncing';
  }

  /**
   * Check if delete button should be disabled
   */
  isDeleteDisabled(sale: PendingSale): boolean {
    return !sale.id || 
           this.deletingIds.has(sale.id) ||
           sale.sync_status === 'syncing';
  }
}
