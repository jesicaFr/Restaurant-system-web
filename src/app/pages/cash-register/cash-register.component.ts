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
  templateUrl: './cash-register.component.html',
  styleUrls: ['./cash-register.component.css']
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
