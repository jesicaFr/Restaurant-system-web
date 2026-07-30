import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CreateOrderRequest, Order } from '../../core/models/order.model';
import { MenuItem } from '../../core/models/menu-item.model';
import { Table } from '../../core/models/table.model';
import { MenuItemService } from '../../core/services/menu-item.service';
import { OrderService } from '../../core/services/order.service';
import { TableService } from '../../core/services/table.service';
import { ConfirmationService } from '../../shared/services/confirmation.service';

interface DraftOrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit {
  readonly displayedColumns = ['name', 'quantity', 'price', 'total', 'actions'];
  readonly orderStatuses = ['Pendiente', 'En preparación', 'Entregado'];

  orders: Order[] = [];
  tables: Table[] = [];
  menuItems: MenuItem[] = [];
  draftItems: DraftOrderItem[] = [];
  selectedMenuItemId: number | null = null;
  selectedQuantity = 1;
  orderForm: FormGroup;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
    private readonly menuItemService: MenuItemService,
    private readonly confirmation: ConfirmationService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.orderForm = this.fb.group({
      tableId: [null, Validators.required],
      status: ['Pendiente', Validators.required],
      paymentMethod: ['Efectivo', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadTables();
    this.loadMenuItems();
  }

  get availableTables(): Table[] {
    return this.tables.filter((table) => !table.isOccupied);
  }

  createOrder(): void {
    if (this.orderForm.invalid || this.draftItems.length === 0) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const payload: CreateOrderRequest = {
      tableId: Number(this.orderForm.value.tableId),
      status: String(this.orderForm.value.status),
      paymentMethod: String(this.orderForm.value.paymentMethod),
      items: this.draftItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
    };

    this.errorMessage = '';
    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.draftItems = [];
        this.selectedMenuItemId = null;
        this.selectedQuantity = 1;
        this.orderForm.reset({
          tableId: null,
          status: 'Pendiente',
          paymentMethod: 'Efectivo',
        });
        this.loadOrders();
        this.loadTables();
        this.loadMenuItems();
      },
      error: () =>
        this.showError('No se pudo guardar el pedido. Verificá la mesa y el stock disponible.'),
    });
  }

  addItem(): void {
    const quantity = Number(this.selectedQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      this.showError('La cantidad debe ser un número entero mayor que cero.');
      return;
    }

    if (this.selectedMenuItemId === null) {
      this.showError('Seleccioná un producto.');
      return;
    }

    const item = this.menuItems.find((menuItem) => menuItem.id === this.selectedMenuItemId);
    const existingDraft = this.draftItems.find(
      (draftItem) => draftItem.menuItemId === this.selectedMenuItemId,
    );
    const requestedQuantity = (existingDraft?.quantity ?? 0) + quantity;

    if (!item || !item.isAvailable || item.quantity < requestedQuantity) {
      this.showError('No hay stock suficiente para agregar ese producto.');
      return;
    }

    this.draftItems = existingDraft
      ? this.draftItems.map((draftItem) =>
          draftItem.menuItemId === item.id
            ? { ...draftItem, quantity: requestedQuantity }
            : draftItem,
        )
      : [
          ...this.draftItems,
          {
            menuItemId: item.id,
            name: item.name,
            quantity,
            unitPrice: item.price,
          },
        ];

    this.selectedMenuItemId = null;
    this.selectedQuantity = 1;
    this.errorMessage = '';
  }

  removeItem(index: number): void {
    this.draftItems = this.draftItems.filter((_, itemIndex) => itemIndex !== index);
  }

  updateStatus(order: Order, status: string): void {
    if (status === order.status) {
      return;
    }

    this.orderService.updateStatus(order.id, status).subscribe({
      next: () => {
        this.loadOrders();
        this.loadTables();
      },
      error: () => this.showError('No se pudo actualizar el estado del pedido.'),
    });
  }

  releaseTable(table: Table): void {
    this.tableService
      .updateTable(table.id, {
        number: table.number,
        capacity: table.capacity,
        isOccupied: false,
      })
      .subscribe({
        next: () => this.loadTables(),
        error: () => this.showError('No se pudo liberar la mesa.'),
      });
  }

  deleteOrder(id: number): void {
    this.confirmation.confirm({
      title: 'Eliminar pedido',
      message: '¿Desea eliminar este pedido?',
    }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.orderService.deleteOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: () => this.showError('No se pudo eliminar el pedido.'),
      });
    });
  }

  private loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.cdr.markForCheck();
      },
      error: () => this.showError('No se pudieron cargar los pedidos.'),
    });
  }

  private loadTables(): void {
    this.tableService.getTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        this.cdr.markForCheck();
      },
      error: () => this.showError('No se pudieron cargar las mesas.'),
    });
  }

  private loadMenuItems(): void {
    this.menuItemService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
        this.cdr.markForCheck();
      },
      error: () => this.showError('No se pudieron cargar los productos.'),
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.cdr.markForCheck();
  }
}
