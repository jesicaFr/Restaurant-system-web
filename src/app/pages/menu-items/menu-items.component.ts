import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MenuItemService } from '../../core/services/menu-item.service';
import { CreateMenuItemRequest, MenuItem } from '../../core/models/menu-item.model';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.css']
})
export class MenuItemsComponent implements OnInit {
  items: MenuItem[] = [];
  displayedColumns = ['name', 'description', 'price', 'quantity', 'isAvailable', 'actions'];
  itemForm: FormGroup;
  editingId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly menuItemService: MenuItemService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]],
      isAvailable: [true, Validators.required]
    });

    this.itemForm.get('quantity')?.valueChanges.subscribe((quantity) => {
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
    this.menuItemService.getMenuItems().subscribe((items) => {
      this.items = items;
      this.cdr.markForCheck();
    });
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      return;
    }

    const payload: CreateMenuItemRequest = this.itemForm.value;

    if (this.editingId) {
      this.menuItemService.updateMenuItem(this.editingId, payload).subscribe(() => this.resetFormAndReload());
      return;
    }

    this.menuItemService.createMenuItem(payload).subscribe(() => this.resetFormAndReload());
  }

  editItem(item: MenuItem): void {
    this.editingId = item.id;
    this.itemForm.patchValue({
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      isAvailable: item.isAvailable
    });
  }

  deleteItem(id: number): void {
    if (!confirm('¿Desea eliminar este producto?')) {
      return;
    }
    this.menuItemService.deleteMenuItem(id).subscribe(() => this.loadItems());
  }

  resetForm(): void {
    this.editingId = null;
    this.itemForm.reset({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      isAvailable: true
    });
  }

  private resetFormAndReload(): void {
    this.resetForm();
    this.cdr.markForCheck();
    this.loadItems();
  }
}
