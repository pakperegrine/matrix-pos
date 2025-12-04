import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SyncService, SyncStatus } from '../../../services/sync.service';

@Component({
  selector: 'app-sync-status',
  standalone: false,
  templateUrl: './sync-status.component.html',
  styleUrls: ['./sync-status.component.scss']
})
export class SyncStatusComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  syncStatus: SyncStatus = {
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    lastError: null
  };
  
  showDetails = false;
  isManualSyncing = false;

  constructor(private syncService: SyncService) {}

  ngOnInit(): void {
    // Subscribe to sync status updates
    this.syncService.syncStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.syncStatus = status;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle details panel
   */
  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  /**
   * Manually trigger sync
   */
  async manualSync(): Promise<void> {
    if (this.isManualSyncing || this.syncStatus.isSyncing) {
      return;
    }

    this.isManualSyncing = true;
    
    try {
      const result = await this.syncService.syncPendingSales();
      console.log('Sync completed:', result);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      this.isManualSyncing = false;
    }
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<void> {
    const isConnected = await this.syncService.testConnection();
    const message = isConnected 
      ? 'Backend connection successful!' 
      : 'Backend connection failed!';
    alert(message);
  }

  /**
   * Format last sync time
   */
  getLastSyncText(): string {
    if (!this.syncStatus.lastSyncTime) {
      return 'Never synced';
    }

    const now = new Date();
    const diff = now.getTime() - this.syncStatus.lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(): string {
    if (!this.syncStatus.isOnline) {
      return 'status-offline';
    }
    if (this.syncStatus.isSyncing) {
      return 'status-syncing';
    }
    if (this.syncStatus.pendingCount > 0) {
      return 'status-pending';
    }
    return 'status-online';
  }

  /**
   * Get status text
   */
  getStatusText(): string {
    if (!this.syncStatus.isOnline) {
      return 'Offline';
    }
    if (this.syncStatus.isSyncing) {
      return 'Syncing...';
    }
    if (this.syncStatus.pendingCount > 0) {
      return `${this.syncStatus.pendingCount} Pending`;
    }
    return 'Online';
  }

  /**
   * Get status icon
   */
  getStatusIcon(): string {
    if (!this.syncStatus.isOnline) {
      return '⚠️';
    }
    if (this.syncStatus.isSyncing) {
      return '🔄';
    }
    if (this.syncStatus.pendingCount > 0) {
      return '⏳';
    }
    return '✅';
  }
}
