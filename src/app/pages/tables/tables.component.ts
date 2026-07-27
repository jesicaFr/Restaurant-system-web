import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  tables: Table[] = [];
  tableForm: FormGroup;
  editingId: number | null = null;
  searchQuery = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly tableService: TableService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.tableForm = this.fb.group({
      number: ['', Validators.required],
      capacity: [null, [Validators.required, Validators.min(2), Validators.pattern(/^[0-9]+$/)]],
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
      this.cdr.markForCheck();
    });
  }

  get filteredTables(): Table[] {
    if (!this.searchQuery.trim()) {
      return this.tables;
    }

    const query = this.searchQuery.toLowerCase();
    return this.tables.filter((table) =>
      table.number.toLowerCase().includes(query) ||
      String(table.capacity).includes(query) ||
      table.status.toLowerCase().includes(query) ||
      (table.isOccupied ? 'ocupada' : 'disponible').includes(query)
    );
  }

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  saveTable(): void {
    if (this.tableForm.invalid) {
      return;
    }

    const number = this.tableForm.value.number.trim();
    const isDuplicate = this.tables.some((table) =>
      table.id !== this.editingId && table.number.trim().toLowerCase() === number.toLowerCase()
    );

    if (isDuplicate) {
      this.tableForm.get('number')?.setErrors({ duplicate: true });
      return;
    }

    const payload: CreateTableRequest = { ...this.tableForm.value, number };

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
    this.cdr.markForCheck();
    this.loadTables();
  }
}
