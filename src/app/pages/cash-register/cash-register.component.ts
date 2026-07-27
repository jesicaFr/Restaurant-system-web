import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DailySalesDto } from '../../core/models/cash-register.model';
import { CashRegisterService } from '../../core/services/cash-register.service';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.css'],
})
export class CashRegisterComponent implements OnInit {
  sales: DailySalesDto | null = null;
  dateForm: FormGroup;
  errorMessage = '';
  readonly maxDate = this.toDateInputValue(new Date());
  readonly minDate = this.toDateInputValue(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  constructor(
    private readonly fb: FormBuilder,
    private readonly cashRegisterService: CashRegisterService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.dateForm = this.fb.group({
      date: [this.maxDate, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    if (this.dateForm.invalid) {
      this.dateForm.markAllAsTouched();
      return;
    }

    const date = String(this.dateForm.value.date);
    this.cashRegisterService.getDailySales(date).subscribe({
      next: (sales) => {
        this.sales = sales;
        this.errorMessage = '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.sales = null;
        this.errorMessage = 'No se pudo consultar el resumen de caja.';
        this.cdr.markForCheck();
      },
    });
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
