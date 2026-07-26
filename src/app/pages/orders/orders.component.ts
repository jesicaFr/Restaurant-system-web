import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { OrderService } from '../../core/services/order.service';
import { TableService } from '../../core/services/table.service';
import { MenuItemService } from '../../core/services/menu-item.service';
import { CreateOrderRequest, Order, OrderDetail } from '../../core/models/order.model';
import { Table } from '../../core/models/table.model';
import { MenuItem } from '../../core/models/menu-item.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Pedidos</h2>
      </div>

      <form [formGroup]="orderForm" (ngSubmit)="createOrder()" class="form-card">
        <mat-card>
          <mat-card-title>Crear pedido</mat-card-title>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field>
                <mat-label>Mesa</mat-label>
                <mat-select formControlName="tableId">
                  <mat-option *ngFor="let table of tables" [value]="table.id">{{ table.number }} - {{ table.capacity }} personas</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Estado</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="Pendiente">Pendiente</mat-option>
                  <mat-option value="En preparación">En preparación</mat-option>
                  <mat-option value="Entregado">Entregado</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="items-section">
              <h3>Agregar productos</h3>
              <div class="item-row">
                <mat-form-field>
                  <mat-label>Producto</mat-label>
                  <mat-select [(ngModel)]="selectedMenuItemId" [ngModelOptions]="{standalone: true}">
                    <mat-option *ngFor="let item of menuItems" [value]="item.id">{{ item.name }} - {{ item.price | currency }}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field>
                  <mat-label>Cantidad</mat-label>
                  <input matInput type="number" [(ngModel)]="selectedQuantity" [ngModelOptions]="{standalone: true}" />
                </mat-form-field>
                <button mat-raised-button color="primary" type="button" (click)="addItem()">Agregar</button>
              </div>

              <table mat-table [dataSource]="draftItems" class="mat-elevation-z2 full-width">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Producto</th>
                  <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef>Precio unit.</th>
                  <td mat-cell *matCellDef="let item">{{ item.unitPrice | currency }}</td>
                </ng-container>
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity * item.unitPrice | currency }}</td>
                </ng-container>
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <button mat-icon-button color="warn" (click)="removeItem(i)"><mat-icon>delete</mat-icon></button>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" type="submit" [disabled]="orderForm.invalid || draftItems.length === 0">Guardar pedido</button>
          </mat-card-actions>
        </mat-card>
      </form>

      <div class="orders-list">
        <mat-card *ngFor="let order of orders" class="order-card">
          <mat-card-title>Pedido #{{ order.id }}</mat-card-title>
          <mat-card-content>
            <p><strong>Mesa:</strong> {{ order.tableId }}</p>
            <p><strong>Fecha:</strong> {{ order.orderDate | date:'short' }}</p>
            <p><strong>Estado:</strong> {{ order.status }}</p>
            <p><strong>Total:</strong> {{ order.totalAmount | currency }}</p>
            <ul>
              <li *ngFor="let detail of order.orderDetails">{{ detail.menuItemName }} x{{ detail.quantity }} - {{ detail.totalPrice | currency }}</li>
            </ul>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="updateStatus(order)">Cambiar estado</button>
            <button mat-button color="warn" (click)="deleteOrder(order.id)">Eliminar</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `.page { display: flex; flex-direction: column; gap: 1.5rem; }`,
    `.page-header { display: flex; justify-content: space-between; align-items: center; }`,
    `.form-card { max-width: 1000px; }`,
    `.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }`,
    `.items-section { margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }`,
    `.item-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }`,
    `.orders-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }`,
    `.full-width { width: 100%; }`
  ]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  tables: Table[] = [];
  menuItems: MenuItem[] = [];
  draftItems: Array<{ menuItemId: number; name: string; quantity: number; unitPrice: number }> = [];
  displayedColumns = ['name', 'quantity', 'price', 'total', 'actions'];
  selectedMenuItemId: number | null = null;
  selectedQuantity = 1;
  orderForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
    private readonly menuItemService: MenuItemService
  ) {
    this.orderForm = this.fb.group({
      tableId: [null, Validators.required],
      status: ['Pendiente', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.tableService.getTables().subscribe((tables) => (this.tables = tables));
    this.menuItemService.getMenuItems().subscribe((items) => (this.menuItems = items));
  }

  createOrder(): void {
    if (this.orderForm.invalid || this.draftItems.length === 0) {
      return;
    }

    const payload: CreateOrderRequest = {
      tableId: this.orderForm.value.tableId,
      items: this.draftItems.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
    };

    this.orderService.createOrder(payload).subscribe(() => {
      this.draftItems = [];
      this.orderForm.reset({ tableId: null, status: 'Pendiente' });
      this.loadOrders();
    });
  }

  addItem(): void {
    if (!this.selectedMenuItemId) {
      return;
    }

    const item = this.menuItems.find((menuItem) => menuItem.id === this.selectedMenuItemId);
    if (!item) {
      return;
    }

    this.draftItems.push({
      menuItemId: item.id,
      name: item.name,
      quantity: this.selectedQuantity,
      unitPrice: item.price
    });
    this.selectedQuantity = 1;
  }

  removeItem(index: number): void {
    this.draftItems.splice(index, 1);
  }

  updateStatus(order: Order): void {
    const nextStatus = prompt('Nuevo estado:', order.status);
    if (!nextStatus) {
      return;
    }
    this.orderService.updateOrder(order.id, { status: nextStatus }).subscribe(() => this.loadOrders());
  }

  deleteOrder(id: number): void {
    if (!confirm('¿Desea eliminar este pedido?')) {
      return;
    }
    this.orderService.deleteOrder(id).subscribe(() => this.loadOrders());
  }

  private loadOrders(): void {
    this.orderService.getOrders().subscribe((orders) => {
      this.orders = orders;
    });
  }
}
