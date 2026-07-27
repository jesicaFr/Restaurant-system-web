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
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
    private readonly menuItemService: MenuItemService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.orderForm = this.fb.group({
      tableId: [null, Validators.required],
      status: ['Pendiente', Validators.required],
      paymentMethod: ['Efectivo', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadTables();
    this.loadMenuItems();
  }

  createOrder(): void {
    if (this.orderForm.invalid || this.draftItems.length === 0) {
      return;
    }

    this.errorMessage = '';

    const payload: CreateOrderRequest = {
      tableId: this.orderForm.value.tableId,
      status: this.orderForm.value.status,
      paymentMethod: this.orderForm.value.paymentMethod,
      items: this.draftItems.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
    };

    this.orderService.createOrder(payload).subscribe({
      next: (createdOrder) => {
        this.orders = [createdOrder, ...this.orders];
        this.tables = this.tables.map((table) =>
          table.id === payload.tableId
            ? { ...table, isOccupied: true, status: 'Ocupada' }
            : table
        );
        this.draftItems = [];
        this.orderForm.reset({ tableId: null, status: 'Pendiente', paymentMethod: 'Efectivo' });
        this.cdr.detectChanges();
        this.loadOrders();
        this.loadTables();
        this.loadMenuItems();
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar el pedido. Verificá que la mesa siga disponible.';
        this.cdr.detectChanges();
      }
    });
  }

  addItem(): void {
    if (!this.selectedMenuItemId) {
      return;
    }

    const item = this.menuItems.find((menuItem) => menuItem.id === this.selectedMenuItemId);
    const quantityAlreadyAdded = this.draftItems
      .filter((draftItem) => draftItem.menuItemId === this.selectedMenuItemId)
      .reduce((total, draftItem) => total + draftItem.quantity, 0);

    if (!item || !item.isAvailable || item.quantity < quantityAlreadyAdded + this.selectedQuantity) {
      this.errorMessage = 'No hay stock suficiente para agregar ese producto.';
      this.cdr.detectChanges();
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
    this.orderService.updateStatus(order.id, status).subscribe(() => {
      this.loadOrders();
      this.loadTables();
    });
  }

  releaseTable(table: Table): void {
    this.tableService.updateTable(table.id, {
      number: table.number,
      capacity: table.capacity,
      status: 'Disponible',
      isOccupied: false
    }).subscribe(() => this.loadTables());
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
      this.cdr.detectChanges();
    });
  }

  get availableTables(): Table[] {
    return this.tables.filter((table) => !table.isOccupied);
  }

  private loadTables(): void {
    this.tableService.getTables().subscribe((tables) => {
      this.tables = tables;
      this.cdr.markForCheck();
    });
  }

  private loadMenuItems(): void {
    this.menuItemService.getMenuItems().subscribe((items) => {
      this.menuItems = items;
      this.cdr.markForCheck();
    });
  }
}
