import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TablesComponent } from './pages/tables/tables.component';
import { MenuItemsComponent } from './pages/menu-items/menu-items.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { CashRegisterComponent } from './pages/cash-register/cash-register.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'menu-items', component: MenuItemsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'cash-register', component: CashRegisterComponent }
    ]
  }
];
