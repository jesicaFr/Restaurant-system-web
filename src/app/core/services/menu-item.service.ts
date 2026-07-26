import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMenuItemRequest, MenuItem } from '../models/menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuItemService {
  private readonly apiUrl = `${environment.apiUrl}/menuitems`;

  constructor(private readonly http: HttpClient) {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  getMenuItem(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/${id}`);
  }

  createMenuItem(item: CreateMenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.apiUrl, item);
  }

  updateMenuItem(id: number, item: CreateMenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, item);
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
