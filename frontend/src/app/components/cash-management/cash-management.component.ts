import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CashManagementService } from '../../services/cash-management.service';
import { CashShift, ShiftDetails } from '../../models/cash-management.model';
import { ToastService } from '../../services/toast.service';
import { ShiftService } from '../../services/shift.service';

@Component({
  selector: 'app-cash-management',
  standalone: false,
  templateUrl: './cash-management.component.html',
  styleUrls: ['./cash-management.component.scss']
})
export class CashManagementComponent implements OnInit, OnDestroy {
  activeShift: CashShift | null = null;
  shiftDetails: ShiftDetails | null = null;
  isLoading = false;
  
  // Modals
  showOpenShiftModal = false;
  showCloseShiftModal = false;
  showCashInModal = false;
  showCashOutModal = false;
  showCashDropModal = false;
  showSupervisorPinModal = false;
  
  // Forms
  openingFloat = 100;
  supervisorPin = '';
  cashAmount = 0;
  cashReason = '';
  cashNotes = '';
  actualCash = 0;
  closeNotes = '';
  
  // Supervisor approval
  pendingAction: (() => void) | null = null;
  
  private destroy$ = new Subject<void>();
  private refreshInterval: any;

  constructor(
    private cashManagementService: CashManagementService,
    private toastService: ToastService,
    private router: Router,
    private shiftService: ShiftService
  ) {}

  ngOnInit(): void {
    this.loadActiveShift();
    
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      if (this.activeShift) {
        this.loadShiftDetails(this.activeShift.id);
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadActiveShift(): void {
    this.isLoading = true;
    this.shiftService.loadActiveShift()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (shift) => {
          this.activeShift = shift;
          if (shift) {
            this.loadShiftDetails(shift.id);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading active shift:', error);
          this.toastService.error('Failed to load active shift');
          this.isLoading = false;
        }
      });
  }

  loadShiftDetails(shiftId: string): void {
    this.cashManagementService.getShiftDetails(shiftId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          this.shiftDetails = details;
          this.activeShift = details.shift;
        },
        error: (error) => {
          console.error('Error loading shift details:', error);
        }
      });
  }

  // ===== SHIFT ACTIONS =====

  openOpenShiftModal(): void {
    this.showOpenShiftModal = true;
  }

  confirmOpenShift(): void {
    this.isLoading = true;
    const userId = localStorage.getItem('userId') || 'admin';
    
    this.cashManagementService.openShift({
      openingFloat: this.openingFloat,
      supervisorId: userId, // TODO: Get actual supervisor
      notes: 'Shift opened'
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (shift) => {
        this.activeShift = shift;
        this.loadShiftDetails(shift.id);
        this.toastService.success('Shift opened successfully');
        this.showOpenShiftModal = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error opening shift:', error);
        this.toastService.error(error.error?.message || 'Failed to open shift');
        this.isLoading = false;
      }
    });
  }

  openCloseShiftModal(): void {
    if (this.activeShift) {
      this.actualCash = this.activeShift.expectedCash;
      this.showCloseShiftModal = true;
    }
  }

  confirmCloseShift(): void {
    if (!this.activeShift) return;
    
    this.pendingAction = () => {
      this.isLoading = true;
      const userId = localStorage.getItem('userId') || 'admin';
      
      this.cashManagementService.closeShift(this.activeShift!.id, {
        actualCash: this.actualCash,
        supervisorId: userId,
        supervisorPin: this.supervisorPin,
        notes: this.closeNotes
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Shift closed successfully');
          this.activeShift = null;
          this.shiftDetails = null;
          this.showCloseShiftModal = false;
          this.showSupervisorPinModal = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error closing shift:', error);
          this.toastService.error(error.error?.message || 'Failed to close shift');
          this.isLoading = false;
        }
      });
    };
    
    this.showSupervisorPinModal = true;
  }

  // ===== CASH MOVEMENT ACTIONS =====

  openCashInModal(): void {
    this.cashAmount = 0;
    this.cashReason = '';
    this.cashNotes = '';
    this.showCashInModal = true;
  }

  confirmCashIn(): void {
    if (!this.activeShift || !this.cashAmount || !this.cashReason) return;
    
    this.pendingAction = () => {
      this.isLoading = true;
      const userId = localStorage.getItem('userId') || 'admin';
      
      this.cashManagementService.cashIn({
        shiftId: this.activeShift!.id,
        amount: this.cashAmount,
        reason: this.cashReason,
        notes: this.cashNotes,
        supervisorId: userId,
        supervisorPin: this.supervisorPin
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Cash-in recorded successfully');
          this.loadShiftDetails(this.activeShift!.id);
          this.showCashInModal = false;
          this.showSupervisorPinModal = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error recording cash-in:', error);
          this.toastService.error(error.error?.message || 'Failed to record cash-in');
          this.isLoading = false;
        }
      });
    };
    
    this.showSupervisorPinModal = true;
  }

  openCashOutModal(): void {
    this.cashAmount = 0;
    this.cashReason = '';
    this.cashNotes = '';
    this.showCashOutModal = true;
  }

  confirmCashOut(): void {
    if (!this.activeShift || !this.cashAmount || !this.cashReason) return;
    
    this.pendingAction = () => {
      this.isLoading = true;
      const userId = localStorage.getItem('userId') || 'admin';
      
      this.cashManagementService.cashOut({
        shiftId: this.activeShift!.id,
        amount: this.cashAmount,
        reason: this.cashReason,
        notes: this.cashNotes,
        supervisorId: userId,
        supervisorPin: this.supervisorPin
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Cash-out recorded successfully');
          this.loadShiftDetails(this.activeShift!.id);
          this.showCashOutModal = false;
          this.showSupervisorPinModal = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error recording cash-out:', error);
          this.toastService.error(error.error?.message || 'Failed to record cash-out');
          this.isLoading = false;
        }
      });
    };
    
    this.showSupervisorPinModal = true;
  }

  openCashDropModal(): void {
    this.cashAmount = 0;
    this.cashNotes = '';
    this.showCashDropModal = true;
  }

  confirmCashDrop(): void {
    if (!this.activeShift || !this.cashAmount) return;
    
    this.pendingAction = () => {
      this.isLoading = true;
      const userId = localStorage.getItem('userId') || 'admin';
      
      this.cashManagementService.cashDrop({
        shiftId: this.activeShift!.id,
        amount: this.cashAmount,
        notes: this.cashNotes,
        supervisorId: userId,
        supervisorPin: this.supervisorPin
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Cash drop recorded successfully');
          this.loadShiftDetails(this.activeShift!.id);
          this.showCashDropModal = false;
          this.showSupervisorPinModal = false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error recording cash drop:', error);
          this.toastService.error(error.error?.message || 'Failed to record cash drop');
          this.isLoading = false;
        }
      });
    };
    
    this.showSupervisorPinModal = true;
  }

  confirmSupervisorPin(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
  }

  cancelSupervisorPin(): void {
    this.showSupervisorPinModal = false;
    this.supervisorPin = '';
    this.pendingAction = null;
  }

  // ===== REPORTS =====

  printXReport(): void {
    if (!this.activeShift) return;
    
    this.cashManagementService.getXReport(this.activeShift.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.printReport(report, 'X Report');
        },
        error: (error) => {
          console.error('Error generating X Report:', error);
          this.toastService.error('Failed to generate X Report');
        }
      });
  }

  printZReport(): void {
    if (!this.activeShift || this.activeShift.status === 'open') return;
    
    this.cashManagementService.getZReport(this.activeShift.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.printReport(report, 'Z Report');
        },
        error: (error) => {
          console.error('Error generating Z Report:', error);
          this.toastService.error('Failed to generate Z Report');
        }
      });
  }

  private printReport(report: any, title: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 5px; text-align: left; }
            .amount { text-align: right; }
            .total { font-weight: bold; border-top: 2px solid #000; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p>Shift #${report.shiftNumber} | Cashier: ${report.cashier}</p>
          <p>Opening: ${new Date(report.openingTime).toLocaleString()}</p>
          ${report.closingTime ? `<p>Closing: ${new Date(report.closingTime).toLocaleString()}</p>` : ''}
          
          <table>
            <tr><th>Opening Float:</th><td class="amount">$${report.openingFloat.toFixed(2)}</td></tr>
            <tr><th>Cash Sales:</th><td class="amount">$${report.totalCashSales.toFixed(2)}</td></tr>
            <tr><th>Card Sales:</th><td class="amount">$${report.totalCardSales.toFixed(2)}</td></tr>
            <tr><th>Cash In:</th><td class="amount">$${report.cashIn.toFixed(2)}</td></tr>
            <tr><th>Cash Out:</th><td class="amount">$${report.cashOut.toFixed(2)}</td></tr>
            <tr><th>Cash Drops:</th><td class="amount">$${report.cashDrops.toFixed(2)}</td></tr>
            <tr class="total"><th>Expected Cash:</th><td class="amount">$${report.expectedCash.toFixed(2)}</td></tr>
            ${report.actualCash !== undefined ? `<tr><th>Actual Cash:</th><td class="amount">$${report.actualCash.toFixed(2)}</td></tr>` : ''}
            ${report.variance !== undefined ? `<tr><th>Variance:</th><td class="amount">$${report.variance.toFixed(2)}</td></tr>` : ''}
          </table>
          
          <p>Drawer Opens: ${report.drawerOpens}</p>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }

  get variance(): number {
    if (!this.activeShift) return 0;
    return this.actualCash - this.activeShift.expectedCash;
  }

  // Filter out sales and refunds - only show manual cash movements
  getNonSaleMovements(): any[] {
    if (!this.shiftDetails?.movements) return [];
    
    return this.shiftDetails.movements
      .filter(m => m.movementType !== 'sale' && m.movementType !== 'refund')
      .slice(-10)
      .reverse();
  }

  // Get friendly label for movement type
  getMovementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'cash_in': 'Cash In',
      'cash_out': 'Cash Out',
      'cash_drop': 'Cash Drop to Safe'
    };
    return labels[type] || type;
  }
}
