import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CashRegisterService } from '../../core/services/cash-register.service';
import { DailySalesDto } from '../../core/models/cash-register.model';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="page">
      <h2>Caja</h2>
      <form [formGroup]="dateForm" (ngSubmit)="loadSales()" class="form-card">
        <mat-card>
          <mat-card-title>Consultar ventas del día</mat-card-title>
          <mat-card-content>
            <mat-form-field>
              <mat-label>Fecha</mat-label>
              <input matInput type="date" formControlName="date" />
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" type="submit" [disabled]="dateForm.invalid">Consultar</button>
          </mat-card-actions>
        </mat-card>
      </form>

      <mat-card *ngIf="sales" class="result-card">
        <mat-card-title>Resumen</mat-card-title>
        <mat-card-content>
          <p><strong>Fecha:</strong> {{ sales.date }}</p>
          <p><strong>Total vendido:</strong> {{ sales.totalSales | currency }}</p>
          <p><strong>Ventas del día:</strong> {{ sales.ordersCount }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.page { display: flex; flex-direction: column; gap: 1.5rem; }`,
    `.form-card { max-width: 400px; }`,
    `.result-card { max-width: 400px; }`
  ]
})
export class CashRegisterComponent implements OnInit {
  sales: DailySalesDto | null = null;
  dateForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cashRegisterService: CashRegisterService
  ) {
    this.dateForm = this.fb.group({
      date: [new Date().toISOString().slice(0, 10), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    const date = this.dateForm.value.date;
    this.cashRegisterService.getDailySales(date).subscribe((sales) => {
      this.sales = sales;
    });
  }
}
