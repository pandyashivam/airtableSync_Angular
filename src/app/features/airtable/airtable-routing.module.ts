import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AirtableConnectComponent } from './components/airtable-connect/airtable-connect.component';
import { AirtableDashboardComponent } from './components/airtable-dashboard/airtable-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'connect', pathMatch: 'full' },
  { path: 'connect', component: AirtableConnectComponent },
  { path: 'dashboard', component: AirtableDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AirtableRoutingModule { }
