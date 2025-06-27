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
    setTimeout(() => {
      this.checkTokenOnStartup();
    }, 0);
  }

  private checkTokenOnStartup(): void {
    if (this.hasToken()) {
      this.getCurrentUser().pipe(
        catchError(error => {
          console.error('Token validation error:', error);
          if (error.status === 401) {
            this.logout();
          } else {
            this.isAuthenticatedSubject.next(false);
          }
          return of(null);
        })
      ).subscribe({
        next: (response) => {
          if (response) {
            if (window.location.pathname === '/airtable/connect') {
              this.navigateToDashboard();
            }
          }
        }
      });
    } else {
      if (window.location.pathname !== '/airtable/connect' && 
          !window.location.pathname.includes('/connect')) {
        window.location.href = '/airtable/connect';
      }
    }
  }

  private navigateToDashboard(): void {
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
