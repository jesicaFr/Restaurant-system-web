import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CreateMenuItemRequest, MenuItem } from '../../core/models/menu-item.model';
import { MenuItemService } from '../../core/services/menu-item.service';
import { ConfirmationService } from '../../shared/services/confirmation.service';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemsComponent implements OnInit {
  readonly displayedColumns = [
    'name',
    'description',
    'price',
    'quantity',
    'isAvailable',
    'actions',
  ];
  private readonly destroyRef = inject(DestroyRef);

  items: MenuItem[] = [];
  itemForm: FormGroup;
  editingId: number | null = null;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly menuItemService: MenuItemService,
    private readonly confirmation: ConfirmationService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]],
      isAvailable: [true, Validators.required],
    });

    this.itemForm
      .get('quantity')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((quantity) => {
        if (quantity === null || quantity === undefined || quantity === '') {
          return;
        }

        this.itemForm.get('isAvailable')?.setValue(Number(quantity) > 0, { emitEvent: false });
      });
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.menuItemService.getMenuItems().subscribe({
      next: (items) => {
        this.items = items;
        this.errorMessage = '';
        this.cdr.markForCheck();
      },
      error: () => this.showError('No se pudieron cargar los productos.'),
    });
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValue = this.itemForm.getRawValue();
    const payload: CreateMenuItemRequest = {
      name: String(formValue.name).trim(),
      description: String(formValue.description).trim(),
      price: Number(formValue.price),
      quantity: Number(formValue.quantity),
      isAvailable: Boolean(formValue.isAvailable),
    };

    const request =
      this.editingId !== null
        ? this.menuItemService.updateMenuItem(this.editingId, payload)
        : this.menuItemService.createMenuItem(payload);

    request.subscribe({
      next: () => this.resetFormAndReload(),
      error: () =>
        this.showError(
          this.editingId !== null
            ? 'No se pudo actualizar el producto.'
            : 'No se pudo crear el producto.',
        ),
    });
  }

  editItem(item: MenuItem): void {
    this.editingId = item.id;
    this.errorMessage = '';
    this.itemForm.patchValue({
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      isAvailable: item.isAvailable,
    });
  }

  deleteItem(id: number): void {
    this.confirmation.confirm({
      title: 'Eliminar producto',
      message: '¿Desea eliminar este producto?',
    }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.menuItemService.deleteMenuItem(id).subscribe({
        next: () => this.loadItems(),
        error: () => this.showError('No se pudo eliminar el producto.'),
      });
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.itemForm.reset({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      isAvailable: true,
    });
  }

  private resetFormAndReload(): void {
    this.resetForm();
    this.loadItems();
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.cdr.markForCheck();
  }
}
