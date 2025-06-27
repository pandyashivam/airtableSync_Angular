import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private tokenKey = 'airtable_auth_token';
  
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token directly from localStorage
    const token = localStorage.getItem(this.tokenKey);

    // Clone the request and add the token if it exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch any errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only handle 401 Unauthorized errors for authentication issues
        // Don't logout for connection errors (status 0)
        if (error.status === 401) {
          console.log('401 Unauthorized error, logging out');
          // Clear tokens directly
          localStorage.removeItem(this.tokenKey);
          localStorage.removeItem('airtable_user');
          // Navigate using window.location to ensure full page reload
          window.location.href = '/airtable/connect';
        }
        return throwError(() => error);
      })
    );
  }
} 