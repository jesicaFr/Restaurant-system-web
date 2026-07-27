import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTableRequest, Table } from '../models/table.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  private readonly apiUrl = `${environment.apiUrl}/tables`;

  constructor(private readonly http: HttpClient) {}

  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(this.apiUrl);
  }

  createTable(table: CreateTableRequest): Observable<Table> {
    return this.http.post<Table>(this.apiUrl, table);
  }

  updateTable(id: number, table: CreateTableRequest): Observable<Table> {
    return this.http.put<Table>(`${this.apiUrl}/${id}`, table);
  }

  deleteTable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
