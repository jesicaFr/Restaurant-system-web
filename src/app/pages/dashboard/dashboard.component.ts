import { ChangeDetectorRef,Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableService } from '../../core/services/table.service';
import { OrderService } from '../../core/services/order.service';
import { CashRegisterService } from '../../core/services/cash-register.service';
import { Table } from '../../core/models/table.model';
import { Order } from '../../core/models/order.model';
import { DailySalesDto } from '../../core/models/cash-register.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalTables = 0;
  occupiedTables = 0;
  availableTables = 0;
  activeOrders = 0;
  dailySales: DailySalesDto = { date: '', totalSales: 0, ordersCount: 0 };

  constructor(
    private readonly tableService: TableService,
    private readonly orderService: OrderService,
    private readonly cashRegisterService: CashRegisterService,
     private readonly cdr: ChangeDetectorRef
  ) {}

  errorMessage = '';

  ngOnInit(): void {
    forkJoin({
      tables: this.tableService.getTables().pipe(catchError((error) => {
        console.error('Error cargando estadísticas de mesas', error);
        this.errorMessage = 'No se pudieron cargar los datos de mesas';
        return of([] as Table[]);
      })),
      orders: this.orderService.getOrders().pipe(catchError((error) => {
        console.error('Error cargando estadísticas de pedidos', error);
        this.errorMessage = 'No se pudieron cargar los datos de pedidos';
        return of([] as Order[]);
      })),
      sales: this.cashRegisterService.getDailySales(new Date().toISOString().slice(0, 10)).pipe(catchError((error) => {
        console.error('Error cargando ventas diarias', error);
        this.errorMessage = 'No se pudieron cargar los datos de ventas';
        return of({ date: '', totalSales: 0, ordersCount: 0 } as DailySalesDto);
      }))
    }).subscribe({
      next: ({ tables, orders, sales }) => {
        console.log({ tables, orders, sales });
        this.totalTables = tables.length;
        this.occupiedTables = tables.filter((table) => table.isOccupied).length;
        this.availableTables = tables.filter((table) => !table.isOccupied).length;
        this.activeOrders = orders.filter((order) => order.status !== 'Entregado').length;
        this.dailySales = sales;
        this.dailySales = sales;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = 'Error cargando el dashboard';
      }
    });
  }

  private loadOrderStats(): void {
    this.orderService.getOrders().subscribe({
      next: (orders: Order[]) => {
        console.log('Dashboard orders', orders);
        this.activeOrders = orders.filter((order) => order.status !== 'Entregado').length;
      },
      error: (error) => {
        console.error('Error cargando estadísticas de pedidos', error);
      }
    });
  }

  private loadSales(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.cashRegisterService.getDailySales(today).subscribe({
      next: (sales) => {
        console.log('Dashboard dailySales', sales);
        this.dailySales = sales;
      },
      error: (error) => {
        console.error('Error cargando ventas diarias', error);
      }
    });
  }
}
