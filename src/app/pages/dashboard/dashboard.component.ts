import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Order } from '../../core/models/order.model';
import { Table } from '../../core/models/table.model';
import { OrderService } from '../../core/services/order.service';
import { TableService } from '../../core/services/table.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  totalTables = 0;
  occupiedTables = 0;
  availableTables = 0;
  activeOrders = 0;
  errorMessage = '';

  constructor(
    private readonly tableService: TableService,
    private readonly orderService: OrderService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin({
      tables: this.tableService.getTables().pipe(
        catchError(() => {
          this.errorMessage = 'No se pudieron cargar los datos de mesas.';
          return of([] as Table[]);
        }),
      ),
      orders: this.orderService.getOrders().pipe(
        catchError(() => {
          this.errorMessage = 'No se pudieron cargar los datos de pedidos.';
          return of([] as Order[]);
        }),
      ),
    }).subscribe(({ tables, orders }) => {
      this.totalTables = tables.length;
      this.occupiedTables = tables.filter((table) => table.isOccupied).length;
      this.availableTables = tables.filter((table) => !table.isOccupied).length;
      this.activeOrders = orders.filter((order) => order.status !== 'Entregado').length;
      this.cdr.markForCheck();
    });
  }
}
