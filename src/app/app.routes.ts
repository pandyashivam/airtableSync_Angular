import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'airtable', pathMatch: 'full' },
  { path: 'airtable', loadChildren: () => import('./features/airtable/airtable.module').then(m => m.AirtableModule) },
  { path: '**', redirectTo: 'airtable' }
];
