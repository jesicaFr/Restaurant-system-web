import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateTableRequest, Table } from '../../core/models/table.model';
import { TableService } from '../../core/services/table.service';

@Component({
  selector: 'app-tables',
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
  ],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css'],
})
export class TablesComponent implements OnInit {
  tables: Table[] = [];
  tableForm: FormGroup;
  editingId: number | null = null;
  searchQuery = '';
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly tableService: TableService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.tableForm = this.fb.group({
      number: ['', Validators.required],
      capacity: [null, [Validators.required, Validators.min(2), Validators.pattern(/^[0-9]+$/)]],
      isOccupied: [false, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTables();
  }

  get filteredTables(): Table[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.tables;
    }

    return this.tables.filter(
      (table) =>
        table.number.toLowerCase().includes(query) ||
        String(table.capacity).includes(query) ||
        table.status.toLowerCase().includes(query) ||
        (table.isOccupied ? 'ocupada' : 'disponible').includes(query),
    );
  }

  loadTables(): void {
    this.tableService.getTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        this.errorMessage = '';
        this.cdr.markForCheck();
      },
      error: () => this.showError('No se pudieron cargar las mesas.'),
    });
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  saveTable(): void {
    if (this.tableForm.invalid) {
      this.tableForm.markAllAsTouched();
      return;
    }

    const number = String(this.tableForm.value.number).trim();
    const isDuplicate = this.tables.some(
      (table) =>
        table.id !== this.editingId && table.number.trim().toLowerCase() === number.toLowerCase(),
    );

    if (isDuplicate) {
      this.tableForm.get('number')?.setErrors({ duplicate: true });
      return;
    }

    const payload: CreateTableRequest = {
      number,
      capacity: Number(this.tableForm.value.capacity),
      isOccupied: Boolean(this.tableForm.value.isOccupied),
    };
    const request = this.editingId
      ? this.tableService.updateTable(this.editingId, payload)
      : this.tableService.createTable(payload);

    request.subscribe({
      next: () => this.resetFormAndReload(),
      error: () =>
        this.showError(
          this.editingId ? 'No se pudo actualizar la mesa.' : 'No se pudo crear la mesa.',
        ),
    });
  }

  editTable(table: Table): void {
    this.editingId = table.id;
    this.errorMessage = '';
    this.tableForm.patchValue({
      number: table.number,
      capacity: table.capacity,
      isOccupied: table.isOccupied,
    });
  }

  deleteTable(id: number): void {
    if (!confirm('¿Desea eliminar esta mesa?')) {
      return;
    }

    this.tableService.deleteTable(id).subscribe({
      next: () => this.loadTables(),
      error: () => this.showError('No se pudo eliminar la mesa.'),
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.tableForm.reset({
      number: '',
      capacity: null,
      isOccupied: false,
    });
  }

  private resetFormAndReload(): void {
    this.resetForm();
    this.loadTables();
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.cdr.markForCheck();
  }
}
