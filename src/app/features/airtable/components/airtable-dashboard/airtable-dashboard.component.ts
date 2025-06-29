import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AirtableService, Base, Table, Record, Pagination, Field } from '../../services/airtable.service';
import { SnackBarService } from '../../../../shared/services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, GridOptions } from 'ag-grid-community';
import { catchError, finalize, of, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RevisionHistoryLoginComponent } from '../revision-history-login/revision-history-login.component';
import { RevisionHistoryDialogueComponent } from '../revision-history-dialogue/revision-history-dialogue.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-airtable-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    FormsModule,
    RouterModule,
    AgGridModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './airtable-dashboard.component.html',
  styleUrls: ['./airtable-dashboard.component.scss'],
  providers: [DatePipe]
})
export class AirtableDashboardComponent implements OnInit {
  isLoading = false;
  isSyncingRevisionHistory = false;
  
  bases: Base[] = [];
  selectedBase: any = null;
  tables: any[] = [];
  selectedTableIndex = 0;
  records: Record[] = [];
  fields: Field[] = [];
  pageSize: number = 100;
  pageIndex: number = 0;
  totalRecords: number = 0;

  gridApi: GridApi | null = null;
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    minWidth: 100,
    maxWidth: 600
  };

  constructor(
    private airtableService: AirtableService,
    private authService: AuthService,
    private snackbar: SnackBarService,
    private location: Location,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadBases();
  }

  loadBases(): void {
    this.isLoading = true;
    this.airtableService.getBases().subscribe(
       (res: any) => {
          if(res.status == 'success')
          {
            this.bases = res.data;
            if ( this.bases.length > 0) {
              this.selectedBase =  this.bases[0];
              this.loadTables(this.selectedBase?._airtableId || '');
            } else {
              this.isLoading = false;
            }
          }
          else{
            this.location.back();
          }
         
        }
      );
  }

  loadTables(baseId: string): void {
    this.isLoading = true;
    this.airtableService.getTables(baseId).subscribe(
      (res : any) => {
        if(res.status == 'success')
        {
          this.tables = res.data;
          if (this.tables.length > 0) {
            this.selectedTableIndex = 0;
            this.loadTableData(this.tables[0]?.name);
          } else {
            this.isLoading = false;
          }
        }
        else
        {
          this.snackbar.showError('Failed to load tables');
          this.isLoading = false;
        }

      }
    )
  }

  loadTableData(tableName: string, page: number = 1, pageSize: number = this.pageSize): void {
    this.isLoading = true;

    this.airtableService.getTableData(tableName, page, pageSize).subscribe(
      (response : any) => {
        if(response.status === 'success')
        {
          this.isLoading = false;
          this.records = response.data;
          this.fields = response.fields;
          this.totalRecords = response.pagination.total;
          this.pageSize = response.pagination.limit;
          this.pageIndex = response.pagination.page - 1;
          
          this.setupGrid();
        }
        else
        {
          this.snackbar.showError('Failed to load table data');
          this.isLoading = false;
        }
      }
    )
  }

  onTabChange(event: any): void {
    this.selectedTableIndex = event;
    // Reset pagination when changing tabs
    this.pageIndex = 0;
    this.pageSize = 100;
    
    if (this.tables.length > 0) {
      this.loadTableData(this.tables[this.selectedTableIndex].name);
    }
  }

  setupGrid(): void {
    this.columnDefs = [{
      headerName: 'Revision History',
      field: 'hasRevisionHistory',
      width: 150,
      cellRenderer: (params: any) => {
        if (params.value === true || params.data.id) {
          return `<a href="javascript:void(0)" class="revision-history-link">View History</a>`;
        }
        return '';
      },
      onCellClicked: (params: any) => {
        if (params.value === true || params.data.id) {
          this.showRevisionHistory(params.data);
        }
      }
    }];
    
    const fieldColumns = this.fields.map(field => {
      const colDef: ColDef = {
        headerName: field.name,
        field: field.id,
        hide: field.type === 'object' || typeof this.records[0]?.[field.id] === 'object'
      };
      
      if (field.type === 'date' || field.type === 'dateTime') {
        colDef.valueFormatter = (params) => {
          if (params.value) {
            return this.datePipe.transform(params.value, 'dd/MM/yyyy') || params.value;
          }
          return '';
        };
      }
      
      return colDef;
    });
    
    this.columnDefs = [...this.columnDefs, ...fieldColumns];
  }

  showRevisionHistory(record: any): void {
    if (!record._airtableId) {
      this.snackbar.showError('Record ID is missing');
      return;
    }
    
    this.dialog.open(RevisionHistoryDialogueComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: {
        recordId: record._airtableId,
        recordName: record['Ticket ID'] + ' - ' + record['Title'] || record['Name']
      }
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  proceedRevisionHistory(): void {
    const dialogRef = this.dialog.open(RevisionHistoryLoginComponent, {
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSyncingRevisionHistory = true;
        
        this.airtableService.revisionHistorySync(
          result.email, 
          result.password, 
          result.mfaCode || undefined
        ).pipe(
          finalize(() => {
            this.isSyncingRevisionHistory = false;
          })
        ).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.snackbar.showSuccess('Revision history synchronized successfully');
            } else {
              this.snackbar.showError('Failed to sync revision history');
            }
          },
          error: (error) => {
            console.error('Error syncing revision history:', error);
            this.snackbar.showError(error.error?.message || 'Failed to sync revision history');
          }
        });
      }
    });
  }
  
  logout(): void {
    this.authService.logout();
  }

  onPageChange(event: PageEvent): void {
    const page = event.pageIndex + 1;
    const pageSize = event.pageSize;
    
    if (this.tables.length > 0) {
      this.loadTableData(this.tables[this.selectedTableIndex].name, page, pageSize);
    }
  }
} 