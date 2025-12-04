import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CashManagementService } from './cash-management.service';
import { AuthService } from './auth.service';
import { CashShift } from '../models/cash-management.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private activeShiftSubject = new BehaviorSubject<CashShift | null>(null);
  public activeShift$ = this.activeShiftSubject.asObservable();
  
  private shiftRequiredSubject = new BehaviorSubject<boolean>(false);
  public shiftRequired$ = this.shiftRequiredSubject.asObservable();

  constructor(
    private cashManagementService: CashManagementService,
    private authService: AuthService
  ) {
    // Subscribe to active shift changes from cash management service
    this.cashManagementService.activeShift$.subscribe(shift => {
      this.activeShiftSubject.next(shift);
    });
  }

  /**
   * Check if current user requires an active shift
   */
  requiresShift(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    // Cashiers and managers must have active shifts
    // Owners and admins can work without shifts (for management tasks)
    return user.role === 'cashier' || user.role === 'manager';
  }

  /**
   * Check if user has an active shift
   */
  hasActiveShift(): boolean {
    return !!this.activeShiftSubject.value;
  }

  /**
   * Get current active shift
   */
  getActiveShift(): CashShift | null {
    return this.activeShiftSubject.value;
  }

  /**
   * Load active shift from server
   */
  loadActiveShift(): Observable<CashShift | null> {
    return this.cashManagementService.getActiveShift().pipe(
      tap(shift => {
        this.activeShiftSubject.next(shift);
        this.checkShiftRequirement();
      }),
      catchError(error => {
        console.error('Error loading active shift:', error);
        return of(null);
      })
    );
  }

  /**
   * Check if shift is required and show modal if needed
   */
  checkShiftRequirement(): void {
    const requiresShift = this.requiresShift();
    const hasShift = this.hasActiveShift();
    
    this.shiftRequiredSubject.next(requiresShift && !hasShift);
  }

  /**
   * Open a new shift
   */
  openShift(data: {
    openingFloat: number;
    notes?: string;
  }): Observable<CashShift> {
    const userId = this.authService.getCurrentUser()?.id || 'admin';
    
    return this.cashManagementService.openShift({
      openingFloat: data.openingFloat,
      supervisorId: userId,
      notes: data.notes || 'Shift opened'
    }).pipe(
      tap(shift => {
        this.activeShiftSubject.next(shift);
        this.shiftRequiredSubject.next(false);
      })
    );
  }

  /**
   * Close current shift
   */
  closeShift(data: {
    actualCash: number;
    notes?: string;
    supervisorPin: string;
  }): Observable<CashShift> {
    const shift = this.activeShiftSubject.value;
    if (!shift) {
      throw new Error('No active shift to close');
    }

    const userId = this.authService.getCurrentUser()?.id || 'admin';

    return this.cashManagementService.closeShift(shift.id, {
      actualCash: data.actualCash,
      supervisorId: userId,
      supervisorPin: data.supervisorPin,
      notes: data.notes
    }).pipe(
      tap(() => {
        this.activeShiftSubject.next(null);
        this.checkShiftRequirement();
      })
    );
  }

  /**
   * Clear active shift (on logout)
   */
  clearShift(): void {
    this.activeShiftSubject.next(null);
    this.shiftRequiredSubject.next(false);
  }
}
