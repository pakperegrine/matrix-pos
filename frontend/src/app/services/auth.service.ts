import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  business_id: string;
  location_id?: string;
  role: 'owner' | 'admin' | 'manager' | 'cashier';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize user from localStorage
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        this.clearAuth();
      }
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = this.currentUserSubject.value;
    return !!(token && user);
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public setAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('businessId', user.business_id);
    this.currentUserSubject.next(user);
  }

  public clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('businessId');
    localStorage.removeItem('selectedLocationId');
    this.currentUserSubject.next(null);
  }

  public logout(): void {
    this.clearAuth();
  }
}
