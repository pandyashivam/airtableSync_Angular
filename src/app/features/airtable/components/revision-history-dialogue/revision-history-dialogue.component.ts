import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AirtableService } from '../../services/airtable.service';
import { catchError, finalize, of } from 'rxjs';

interface RevisionData {
  uuid: string;
  issueId: string;
  columnType: string;
  oldValue: string;
  newValue: string;
  createdDate: string;
  authoredBy: string;
  _id: string;
}

interface RevisionHistory {
  _id: string;
  recordId: string;
  baseId: string;
  tableId: string;
  tableName: string;
  createdAt: string;
  updatedAt: string;
  revisionData: RevisionData[];
}

@Component({
  selector: 'app-revision-history-dialogue',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './revision-history-dialogue.component.html',
  styleUrl: './revision-history-dialogue.component.scss',
  providers: [DatePipe]
})
export class RevisionHistoryDialogueComponent implements OnInit {
  isLoading = true;
  error: string | null = null;
  revisionHistory: RevisionHistory | null = null;
  
  constructor(
    public dialogRef: MatDialogRef<RevisionHistoryDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { recordId: string, recordName: string },
    private airtableService: AirtableService,
    private datePipe: DatePipe
  ) {}
  
  ngOnInit(): void {
    this.loadRevisionHistory();
  }
  
  loadRevisionHistory(): void {
    this.isLoading = true;
    this.error = null;
    
    this.airtableService.getRevisionHistory(this.data.recordId)
      .pipe(
        catchError(error => {
          this.error = error.error?.message || 'Failed to load revision history';
          return of({ status: 'error' });
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response.status === 'success') {
          this.revisionHistory = response.data;
        }
      });
  }
  
  formatDate(date: string): string {
    return this.datePipe.transform(date, 'MMM d, y, h:mm a') || date;
  }
  
  onClose(): void {
    this.dialogRef.close();
  }
}
