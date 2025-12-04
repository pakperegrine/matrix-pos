import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      // Not logged in, redirect to login page
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Get allowed roles from route data
    const allowedRoles = route.data['roles'] as Array<string>;
    
    if (allowedRoles && allowedRoles.length > 0) {
      if (allowedRoles.includes(user.role)) {
        return true;
      } else {
        // User doesn't have the required role, redirect to dashboard
        console.warn(`Access denied. Required roles: ${allowedRoles.join(', ')}, User role: ${user.role}`);
        return this.router.createUrlTree(['/pos']);
      }
    }

    // No role restriction, allow access
    return true;
  }
}
