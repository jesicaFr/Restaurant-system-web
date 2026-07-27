import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  tables: Table[] = [];
  menuItems: MenuItem[] = [];
  draftItems: Array<{ menuItemId: number; name: string; quantity: number; unitPrice: number }> = [];
  displayedColumns = ['name', 'quantity', 'price', 'total', 'actions'];
  readonly orderStatuses = ['Pendiente', 'En preparación', 'Entregado'];
  selectedMenuItemId: number | null = null;
  selectedQuantity = 1;
  orderForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
    private readonly menuItemService: MenuItemService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.orderForm = this.fb.group({
      tableId: [null, Validators.required],
      status: ['Pendiente', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.tableService.getTables().subscribe((tables) => {
      this.tables = tables;
      this.cdr.markForCheck();
    });
    this.menuItemService.getMenuItems().subscribe((items) => {
      this.menuItems = items;
      this.cdr.markForCheck();
    });
  }

  createOrder(): void {
    if (this.orderForm.invalid || this.draftItems.length === 0) {
      return;
    }

    const payload: CreateOrderRequest = {
      tableId: this.orderForm.value.tableId,
      status: this.orderForm.value.status,
      items: this.draftItems.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
    };

    this.orderService.createOrder(payload).subscribe(() => {
      this.draftItems = [];
      this.orderForm.reset({ tableId: null, status: 'Pendiente' });
      this.cdr.markForCheck();
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

    this.draftItems = [...this.draftItems, {
      menuItemId: item.id,
      name: item.name,
      quantity: this.selectedQuantity,
      unitPrice: item.price
    }];
    this.selectedMenuItemId = null;
    this.selectedQuantity = 1;
  }

  removeItem(index: number): void {
    this.draftItems = this.draftItems.filter((_, itemIndex) => itemIndex !== index);
  }

  updateStatus(order: Order, status: string): void {
    if (status === order.status) {
      return;
    }
    this.orderService.updateStatus(order.id, status).subscribe(() => this.loadOrders());
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
      this.cdr.markForCheck();
    });
  }
}
