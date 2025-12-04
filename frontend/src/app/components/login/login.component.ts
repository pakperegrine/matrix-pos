import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  name = '';
  loading = false;
  showPassword = false;
  isSignupMode = false;

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {
    // Check if already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.router.navigate(['/pos']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleMode(): void {
    this.isSignupMode = !this.isSignupMode;
    this.email = '';
    this.password = '';
    this.name = '';
  }

  login(): void {
    if (!this.email || !this.password) {
      this.toastService.error('Please enter email and password');
      return;
    }

    this.loading = true;

    this.http.post<{ token: string; user: any }>(`${this.apiUrl}/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('businessId', response.user.business_id || 'business-1');
        
        this.toastService.success(`Welcome back, ${response.user.name || response.user.email}!`);
        
        // Redirect based on role
        const redirectPath = response.user.role === 'owner' ? '/owner' : '/pos';
        this.router.navigate([redirectPath]);
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Invalid email or password';
        this.toastService.error(message);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  signup(): void {
    if (!this.name || !this.email || !this.password) {
      this.toastService.error('Please fill in all fields');
      return;
    }

    if (this.password.length < 6) {
      this.toastService.error('Password must be at least 6 characters');
      return;
    }

    this.loading = true;

    this.http.post<{ token: string; user: any }>(`${this.apiUrl}/auth/signup`, {
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('businessId', response.user.business_id || 'business-1');
        
        this.toastService.success(`Welcome to Matrix POS, ${response.user.name}!`);
        
        // Redirect based on role
        const redirectPath = response.user.role === 'owner' ? '/owner' : '/pos';
        this.router.navigate([redirectPath]);
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to create account';
        this.toastService.error(message);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.isSignupMode) {
      this.signup();
    } else {
      this.login();
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }
}
