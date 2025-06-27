import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AirtableService } from './features/airtable/services/airtable.service';
import { HttpService } from './shared/services/http.service';
import { SnackBarService } from './shared/services/snackbar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, SharedModule],
  providers: [
    provideAnimations(),
    SnackBarService,
    HttpService,
    AirtableService
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'airtable-sync';
  
  constructor() {
    console.log('AppComponent initialized');
  }
}
