import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
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
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <span class="dashboard-count">0</span>
      </div>

      <div class="cards">
        <mat-card class="stat-card accent-1">
          <div class="card-top"></div>
          <mat-card-title class="stat-title">Total de mesas</mat-card-title>
          <mat-card-content><div class="stat-number">{{ totalTables }}</div></mat-card-content>
        </mat-card>
        <mat-card class="stat-card accent-2">
          <div class="card-top"></div>
          <mat-card-title class="stat-title">Mesas ocupadas</mat-card-title>
          <mat-card-content><div class="stat-number">{{ occupiedTables }}</div></mat-card-content>
        </mat-card>
        <mat-card class="stat-card accent-3">
          <div class="card-top"></div>
          <mat-card-title class="stat-title">Mesas disponibles</mat-card-title>
          <mat-card-content><div class="stat-number">{{ availableTables }}</div></mat-card-content>
        </mat-card>
        <mat-card class="stat-card accent-4">
          <div class="card-top"></div>
          <mat-card-title class="stat-title">Ventas del día</mat-card-title>
          <mat-card-content><div class="stat-number">{{ dailySales?.totalSales | currency:'USD':'symbol':'1.0-0' }}</div></mat-card-content>
        </mat-card>
        <mat-card class="stat-card accent-5">
          <div class="card-top"></div>
          <mat-card-title class="stat-title">Pedidos activos</mat-card-title>
          <mat-card-content><div class="stat-number">{{ activeOrders }}</div></mat-card-content>
        </mat-card>
      </div>

      <div class="actions">
        <a mat-raised-button color="primary" routerLink="/tables" class="btn-primary">Gestionar mesas</a>
        <a mat-raised-button color="accent" routerLink="/menu-items" class="btn-secondary">Gestionar menú</a>
        <a mat-raised-button color="warn" routerLink="/orders" class="btn-tertiary">Gestionar pedidos</a>
      </div>
    </div>
  `,
  styles: [
    `.dashboard { display: flex; flex-direction: column; gap: 1.5rem; }`,
    `.dashboard-header { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }`,
    `.dashboard-header h1 { margin: 0; font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 700; color: #3C302B; letter-spacing: -0.05em; }`,
    `.dashboard-count { font-size: 1rem; color: #6b5d52; padding: 0.35rem 0.75rem; background: rgba(60,48,43,0.08); border-radius: 999px; font-weight: 600; }`,
    `.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }`,
    `.stat-card { min-height: 180px; display:flex; flex-direction:column; justify-content:flex-start; padding:0; background: #F5ECE0; border-radius: 22px; overflow: hidden; border: 1px solid rgba(60,48,43,0.12); }`,
    `.stat-card .card-top { height: 12px; width: 100%; }`,
    `.stat-card .stat-title { font-family: 'Cormorant Garamond', serif; font-size: 0.94rem; color: #3C302B; margin: 1.25rem 1.5rem 0.35rem; letter-spacing: 0.02em; }`,
    `.stat-card .stat-number { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 900; color: #2f221d; margin: 0 1.5rem 1.5rem; line-height: 1.05; }`,
    `.actions { display: flex; gap: 1rem; flex-wrap: wrap; padding-top: 0.5rem; }`,
    `.btn-primary { background: #336780 !important; box-shadow: 0 18px 40px rgba(51,103,128,0.2); }`,
    `.btn-secondary { background: #A9533C !important; box-shadow: 0 18px 40px rgba(169,83,60,0.22); }`,
    `.btn-tertiary { background: #58613A !important; box-shadow: 0 18px 40px rgba(88,97,58,0.22); }`,
    `.btn-primary:hover, .btn-secondary:hover, .btn-tertiary:hover { transform: translateY(-2px); }`,
    `@media (max-width: 800px) { .cards { grid-template-columns: 1fr; } }`
  ]
})
export class DashboardComponent implements OnInit {
  totalTables = 42;
  occupiedTables = 18;
  availableTables = 24;
  activeOrders = 12;
  dailySales: DailySalesDto = { date: '', totalSales: 1850, ordersCount: 12 };

  constructor(
    private readonly tableService: TableService,
    private readonly orderService: OrderService,
    private readonly cashRegisterService: CashRegisterService
  ) {}

  ngOnInit(): void {
    this.tableService.getTables().subscribe((tables: Table[]) => {
      this.totalTables = tables.length;
      this.occupiedTables = tables.filter((table) => table.isOccupied).length;
      this.availableTables = tables.filter((table) => !table.isOccupied).length;
    });

    this.orderService.getOrders().subscribe((orders: Order[]) => {
      this.activeOrders = orders.filter((order) => order.status !== 'Entregado').length;
    });

    this.cashRegisterService.getDailySales(new Date().toISOString().slice(0, 10)).subscribe((sales) => {
      this.dailySales = sales;
    });
  }
}
