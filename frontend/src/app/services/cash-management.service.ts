import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CashShift, CashMovement, ShiftDetails, XReport, ZReport } from '../models/cash-management.model';

@Injectable({
  providedIn: 'root'
})
export class CashManagementService {
  private apiUrl = `${environment.apiUrl}/cash-management`;
  private activeShiftSubject = new BehaviorSubject<CashShift | null>(null);
  public activeShift$ = this.activeShiftSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const businessId = localStorage.getItem('businessId') || 'default_business';
    const userId = localStorage.getItem('userId') || 'admin';
    return new HttpHeaders({
      'x-business-id': businessId,
      'x-user-id': userId
    });
  }

  // ===== SHIFT MANAGEMENT =====

  getActiveShift(): Observable<CashShift | null> {
    return this.http.get<CashShift | null>(`${this.apiUrl}/shift/active`, { headers: this.getHeaders() })
      .pipe(tap(shift => this.activeShiftSubject.next(shift)));
  }

  openShift(data: {
    terminalId?: string;
    openingFloat: number;
    supervisorId?: string;
    supervisorPin?: string;
    notes?: string;
  }): Observable<CashShift> {
    return this.http.post<CashShift>(`${this.apiUrl}/shift/open`, data, { headers: this.getHeaders() })
      .pipe(tap(shift => this.activeShiftSubject.next(shift)));
  }

  closeShift(shiftId: string, data: {
    actualCash: number;
    supervisorId: string;
    supervisorPin: string;
    notes?: string;
  }): Observable<CashShift> {
    return this.http.post<CashShift>(`${this.apiUrl}/shift/${shiftId}/close`, data, { headers: this.getHeaders() })
      .pipe(tap(() => this.activeShiftSubject.next(null)));
  }

  getShiftDetails(shiftId: string): Observable<ShiftDetails> {
    return this.http.get<ShiftDetails>(`${this.apiUrl}/shift/${shiftId}`, { headers: this.getHeaders() });
  }

  getShiftHistory(limit = 50, offset = 0): Observable<{ shifts: CashShift[]; total: number; limit: number; offset: number }> {
    return this.http.get<any>(`${this.apiUrl}/shifts/history?limit=${limit}&offset=${offset}`, { headers: this.getHeaders() });
  }

  // ===== CASH MOVEMENTS =====

  cashIn(data: {
    shiftId: string;
    amount: number;
    reason: string;
    notes?: string;
    supervisorId: string;
    supervisorPin: string;
  }): Observable<CashMovement> {
    return this.http.post<CashMovement>(`${this.apiUrl}/movement/cash-in`, data, { headers: this.getHeaders() });
  }

  cashOut(data: {
    shiftId: string;
    amount: number;
    reason: string;
    notes?: string;
    supervisorId: string;
    supervisorPin: string;
  }): Observable<CashMovement> {
    return this.http.post<CashMovement>(`${this.apiUrl}/movement/cash-out`, data, { headers: this.getHeaders() });
  }

  cashDrop(data: {
    shiftId: string;
    amount: number;
    notes?: string;
    supervisorId: string;
    supervisorPin: string;
  }): Observable<CashMovement> {
    return this.http.post<CashMovement>(`${this.apiUrl}/movement/cash-drop`, data, { headers: this.getHeaders() });
  }

  recordSale(data: {
    shiftId: string;
    amount: number;
    invoiceId: string;
  }): Observable<CashMovement> {
    return this.http.post<CashMovement>(`${this.apiUrl}/movement/sale`, data, { headers: this.getHeaders() });
  }

  // ===== DRAWER MANAGEMENT =====

  openDrawerManually(data: {
    shiftId?: string;
    terminalId?: string;
    reason: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/drawer/open`, data, { headers: this.getHeaders() });
  }

  // ===== REPORTS =====

  getXReport(shiftId: string): Observable<XReport> {
    return this.http.get<XReport>(`${this.apiUrl}/reports/x-report/${shiftId}`, { headers: this.getHeaders() });
  }

  getZReport(shiftId: string): Observable<ZReport> {
    return this.http.get<ZReport>(`${this.apiUrl}/reports/z-report/${shiftId}`, { headers: this.getHeaders() });
  }

  // ===== HELPERS =====

  refreshActiveShift(): void {
    this.getActiveShift().subscribe();
  }

  clearActiveShift(): void {
    this.activeShiftSubject.next(null);
  }
}
