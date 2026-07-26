import { Component, OnInit } from '@angular/core';
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
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Menú</h2>
        <button mat-raised-button color="primary" (click)="resetForm()">Nuevo producto</button>
      </div>

      <form [formGroup]="itemForm" (ngSubmit)="saveItem()" class="form-card">
        <mat-card>
          <mat-card-title>{{ editingId ? 'Editar producto' : 'Crear producto' }}</mat-card-title>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field>
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Precio</mat-label>
                <input matInput type="number" formControlName="price" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="description"></textarea>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Disponibilidad</mat-label>
                <mat-select formControlName="isAvailable">
                  <mat-option [value]="true">Disponible</mat-option>
                  <mat-option [value]="false">No disponible</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" type="submit" [disabled]="itemForm.invalid">Guardar</button>
            <button mat-button type="button" (click)="resetForm()">Cancelar</button>
          </mat-card-actions>
        </mat-card>
      </form>

      <table mat-table [dataSource]="items" class="mat-elevation-z2 full-width">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let item">{{ item.name }}</td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Descripción</th>
          <td mat-cell *matCellDef="let item">{{ item.description }}</td>
        </ng-container>
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Precio</th>
          <td mat-cell *matCellDef="let item">{{ item.price | currency }}</td>
        </ng-container>
        <ng-container matColumnDef="isAvailable">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let item">{{ item.isAvailable ? 'Disponible' : 'No disponible' }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let item">
            <button mat-icon-button color="primary" (click)="editItem(item)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteItem(item.id)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [
    `.page { display: flex; flex-direction: column; gap: 1.5rem; }`,
    `.page-header { display: flex; justify-content: space-between; align-items: center; }`,
    `.form-card { max-width: 900px; }`,
    `.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }`,
    `.full-width { width: 100%; }`
  ]
})
export class MenuItemsComponent implements OnInit {
  items: MenuItem[] = [];
  displayedColumns = ['name', 'description', 'price', 'isAvailable', 'actions'];
  itemForm: FormGroup;
  editingId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly menuItemService: MenuItemService
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      isAvailable: [true, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.menuItemService.getMenuItems().subscribe((items) => {
      this.items = items;
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
      isAvailable: true
    });
  }

  private resetFormAndReload(): void {
    this.resetForm();
    this.loadItems();
  }
}
