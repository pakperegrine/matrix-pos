import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  name = '';
  loading = false;
  showPassword = false;
  isSignupMode = false;
  private returnUrl: string = '/pos';

  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/pos'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/pos';

    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
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
        // Use AuthService to set authentication
        this.authService.setAuth(response.token, response.user);
        
        this.toastService.success(`Welcome back, ${response.user.name || response.user.email}!`);
        
        // Redirect based on role or return URL
        let redirectPath = this.returnUrl;
        if (redirectPath === '/pos' && response.user.role === 'owner') {
          redirectPath = '/owner';
        }
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
        // Use AuthService to set authentication
        this.authService.setAuth(response.token, response.user);
        
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
