import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Base {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  baseId: string;
}

export interface Record {
  [key: string]: any;
}

export interface Field {
  id: string;
  name: string;
  type: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: string;
  [key: string]: any;
  data?: T;
}

export interface TableDataResponse {
  data: Record[];
  fields: Field[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AirtableService {
  constructor(private http: HttpService) {}

  getBases() {
    return this.http.get('/airtable/bases');
  }

  getTables(baseId: string) {
    return this.http.get(`/airtable/tables/${baseId}`);
  }

  getTableData(modelName: string, page: number = 1, pageSize: number = 10) {
    let param = {
      page: page.toString(),
      limit: pageSize.toString()
    }
    return this.http.get(`/airtable/model/${modelName}`, param);
  }

  syncAllData() {
    return this.http.post<ApiResponse<any>>('/airtable/sync', {});
  }
  
  revisionHistorySync(email: string, password: string, mfaCode?: string) {
    return this.http.post<ApiResponse<any>>('/airtable/revision-history-sync', {
      email,
      password,
      mfaCode
    });
  }
  
  getRevisionHistory(recordId: string) {
    return this.http.get<ApiResponse<any>>(`/airtable/revision-history/${recordId}`);
  }
} 