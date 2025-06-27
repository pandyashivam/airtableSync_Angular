import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../../../shared/services/snackbar.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { AirtableService } from '../../services/airtable.service';

@Component({
  selector: 'app-airtable-connect',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './airtable-connect.component.html',
  styleUrls: ['./airtable-connect.component.scss']
})
export class AirtableConnectComponent implements OnInit {
  isLoading = false;
  loadingMessage = 'Processing...';
  
  constructor(
    private snackbar: SnackBarService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private airtableService: AirtableService,
    private ngZone: NgZone,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log('AirtableConnectComponent initialized');
    
    // Check if already authenticated
    if(this.authService.getToken()) {
      console.log('User is authenticated, redirecting to dashboard');
      // Force a full navigation to dashboard
      window.location.href = '/airtable/dashboard';
      return;
    }
    
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];
      
      if (code && state) {
        console.log('OAuth callback detected, handling authentication');
        this.handleOAuthCallback(code, state, error);
      }
    });
  }

  handleOAuthCallback(code: string, state: string, error: string | null): void {
    if (error) {
      this.handleError(`Airtable authentication error: ${error}`);
      return;
    }
    
    this.isLoading = true;
    this.loadingMessage = 'Authenticating with Airtable...';

    this.authService.handleAirtableCallback(code, state).subscribe({
      next: (response) => {
        if (response && response.status === 'success') {
          this.snackbar.showSuccess('Successfully connected to Airtable');
          console.log('Authentication successful, proceeding to sync data');
          this.syncAirtableData();
        } else {
          this.handleError('Failed to connect to Airtable: ' + (response?.message || 'Unknown error'));
        }
      },
      error: (error) => {
        console.error('Authentication error:', error);
        this.handleError(`Error connecting to Airtable: ${error.message || error.error?.message || 'Unknown error'}`);
      }
    });
  }

  private syncAirtableData(): void {
    this.loadingMessage = 'Syncing data from Airtable...';
    console.log('Starting data sync from Airtable');
    
    this.airtableService.syncAllData().subscribe({
      next: (res) => {
        console.log('Data sync completed successfully');
        this.isLoading = false;
        
        // Use window.location for a full page navigation/reload
        console.log('Navigating to dashboard');
        setTimeout(() => {
          window.location.href = '/airtable/dashboard';
        }, 100);
      },
      error: (error) => {
        console.error('Data sync error:', error);
        this.handleError(`Error syncing data from Airtable: ${error.message || 'Unknown error'}`);
      }
    });
  }

  private handleError(message: string): void {  
    this.snackbar.showError(message);
    this.isLoading = false;
  }

  connectToAirtable(): void {
    this.isLoading = true;
    this.loadingMessage = 'Connecting to Airtable...';
    
    this.authService.getAirtableAuthUrl().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.authUrl) {
          window.location.href = response.authUrl;
        } else {
          this.handleError('Failed to get Airtable authorization URL');
        }
      },
      error: (error) => {
        console.error('Error getting auth URL:', error);
        this.handleError(`Error getting Airtable authorization URL: ${error.message || 'Unknown error'}`);
      }
    });
  }
} 