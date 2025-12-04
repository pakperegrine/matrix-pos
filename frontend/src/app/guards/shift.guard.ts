import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ShiftService } from '../services/shift.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ShiftGuard implements CanActivate {
  constructor(
    private shiftService: ShiftService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      return this.router.createUrlTree(['/login']);
    }

    // Only cashiers and managers require active shifts
    if (user.role !== 'cashier' && user.role !== 'manager') {
      return true;
    }

    // Check if shift is required for this route
    const requiresShift = route.data['requiresShift'] !== false;
    
    if (!requiresShift) {
      return true;
    }

    // Check if user has an active shift
    return this.shiftService.activeShift$.pipe(
      take(1),
      map(shift => {
        if (shift) {
          return true;
        } else {
          // Trigger shift modal by checking shift requirement
          this.shiftService.checkShiftRequirement();
          // Redirect to cash management where they can open a shift
          return this.router.createUrlTree(['/cash-management']);
        }
      })
    );
  }
}
