import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DailySalesDto } from '../models/cash-register.model';

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  private readonly apiUrl = `${environment.apiUrl}/cash-register`;

  constructor(private readonly http: HttpClient) {}

  getDailySales(date: string): Observable<DailySalesDto> {
    const params = new HttpParams().set('date', date);
    return this.http.get<DailySalesDto>(this.apiUrl, { params });
  }
}
