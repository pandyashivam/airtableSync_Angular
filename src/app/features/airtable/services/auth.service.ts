import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AuthResponse {
  status: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    hasAirtableOAuth: boolean;
  };
  message?: string;
  authUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'airtable_auth_token';
  private userKey = 'airtable_user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpService,
    private router: Router
  ) {
    // Delay the token check to avoid circular dependency issues during initialization
    setTimeout(() => {
      this.checkTokenOnStartup();
    }, 0);
  }

  private checkTokenOnStartup(): void {
    console.log('Checking token on startup');
    if (this.hasToken()) {
      console.log('Token found, validating with server');
      this.getCurrentUser().pipe(
        catchError(error => {
          console.error('Token validation error:', error);
          // Don't log out immediately on connection errors (status 0 or network errors)
          if (error.status === 401) {
            // Only logout for actual authentication errors
            console.log('Authentication error (401), logging out');
            this.logout();
          } else {
            // For connection errors, keep the token but mark as not authenticated for now
            console.log('Connection error, keeping token but marking as not authenticated temporarily');
            this.isAuthenticatedSubject.next(false);
          }
          return of(null);
        })
      ).subscribe({
        next: (response) => {
          if (response) {
            console.log('Token is valid, checking current path');
            // User is authenticated, redirect to dashboard if on connect page
            if (window.location.pathname === '/airtable/connect') {
              console.log('On connect page, navigating to dashboard');
              this.navigateToDashboard();
            }
          }
        }
      });
    } else {
      console.log('No token found, checking current path');
      // No token, redirect to connect page if not already there
      if (window.location.pathname !== '/airtable/connect' && 
          !window.location.pathname.includes('/connect')) {
        console.log('Not on connect page, navigating to connect');
        window.location.href = '/airtable/connect';
      }
    }
  }

  private navigateToDashboard(): void {
    console.log('AuthService: Navigating to dashboard');
    window.location.href = '/airtable/dashboard';
  }

  getAirtableAuthUrl() {
    return this.http.get<AuthResponse>('/auth/airtable/auth-url');
  }

  handleAirtableCallback(code: string, state: string) {
    return this.http.post<AuthResponse>('/auth/airtable/callback', { code, state })
      .pipe(
        tap(response => {
          if (response.status === 'success' && response.token) {
            this.setToken(response.token);
            this.setUser(response.user);
          }
        })
      );
  }

  refreshAirtableToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/airtable/refresh-token', {});
  }

  disconnectAirtable(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/airtable/disconnect', {})
      .pipe(
        tap(() => {
          this.logout();
        })
      );
  }

  getCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>('/auth/current-user')
      .pipe(
        tap(response => {
          if (response.status === 'success' && response.user) {
            this.setUser(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    window.location.href = '/airtable/connect';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
