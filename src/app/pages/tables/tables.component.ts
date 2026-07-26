import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TableService } from '../../core/services/table.service';
import { CreateTableRequest, Table } from '../../core/models/table.model';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Mesas</h2>
        <button mat-raised-button color="primary" (click)="resetForm()">Nueva mesa</button>
      </div>

      <form [formGroup]="tableForm" (ngSubmit)="saveTable()" class="form-card">
        <mat-card>
          <mat-card-title>{{ editingId ? 'Editar mesa' : 'Crear mesa' }}</mat-card-title>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field>
                <mat-label>Número</mat-label>
                <input matInput formControlName="number" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Capacidad</mat-label>
                <input matInput type="number" formControlName="capacity" />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Estado</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="Disponible">Disponible</mat-option>
                  <mat-option value="Reservada">Reservada</mat-option>
                  <mat-option value="Ocupada">Ocupada</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Disponibilidad</mat-label>
                <mat-select formControlName="isOccupied">
                  <mat-option [value]="true">Ocupada</mat-option>
                  <mat-option [value]="false">Disponible</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" type="submit" [disabled]="tableForm.invalid">Guardar</button>
            <button mat-button type="button" (click)="resetForm()">Cancelar</button>
          </mat-card-actions>
        </mat-card>
      </form>

      <div class="cards-grid">
        <mat-card *ngFor="let table of tables" class="table-card">
          <mat-card-title>Mesa {{ table.number }}</mat-card-title>
          <mat-card-content>
            <p><strong>Capacidad:</strong> {{ table.capacity }}</p>
            <p><strong>Estado:</strong> {{ table.status }}</p>
            <p><strong>Disponibilidad:</strong> {{ table.isOccupied ? 'Ocupada' : 'Disponible' }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-icon-button color="primary" (click)="editTable(table)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteTable(table.id)"><mat-icon>delete</mat-icon></button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `.page { display: flex; flex-direction: column; gap: 1.5rem; }`,
    `.page-header { display: flex; justify-content: space-between; align-items: center; }`,
    `.form-card { max-width: 900px; }`,
    `.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }`,
    `.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }`,
    `.table-card { min-height: 200px; }`
  ]
})
export class TablesComponent implements OnInit {
  tables: Table[] = [];
  tableForm: FormGroup;
  editingId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly tableService: TableService,
    private readonly dialog: MatDialog
  ) {
    this.tableForm = this.fb.group({
      number: ['', Validators.required],
      capacity: [null, [Validators.required, Validators.min(1)]],
      status: ['Disponible', Validators.required],
      isOccupied: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.tableService.getTables().subscribe((tables) => {
      this.tables = tables;
    });
  }

  saveTable(): void {
    if (this.tableForm.invalid) {
      return;
    }

    const payload: CreateTableRequest = this.tableForm.value;

    if (this.editingId) {
      this.tableService.updateTable(this.editingId, payload).subscribe(() => this.resetFormAndReload());
      return;
    }

    this.tableService.createTable(payload).subscribe(() => this.resetFormAndReload());
  }

  editTable(table: Table): void {
    this.editingId = table.id;
    this.tableForm.patchValue({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      isOccupied: table.isOccupied
    });
  }

  deleteTable(id: number): void {
    if (!confirm('¿Desea eliminar esta mesa?')) {
      return;
    }
    this.tableService.deleteTable(id).subscribe(() => this.loadTables());
  }

  resetForm(): void {
    this.editingId = null;
    this.tableForm.reset({
      number: '',
      capacity: null,
      status: 'Disponible',
      isOccupied: false
    });
  }

  private resetFormAndReload(): void {
    this.resetForm();
    this.loadTables();
  }
}
