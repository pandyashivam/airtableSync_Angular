import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { AgChartsModule } from 'ag-charts-angular';

import { SharedModule } from '../../shared/shared.module';
import { AirtableConnectComponent } from './components/airtable-connect/airtable-connect.component';
import { AirtableRoutingModule } from './airtable-routing.module';

@NgModule({
  declarations: [],
  imports: [
    AirtableRoutingModule,
    CommonModule,
    SharedModule,
    AgGridModule,
    AgChartsModule
  ]
})
export class AirtableModule { }
