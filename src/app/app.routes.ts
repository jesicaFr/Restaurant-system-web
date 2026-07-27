import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (module) => module.DashboardComponent,
          ),
      },
      {
        path: 'tables',
        loadComponent: () =>
          import('./pages/tables/tables.component').then((module) => module.TablesComponent),
      },
      {
        path: 'menu-items',
        loadComponent: () =>
          import('./pages/menu-items/menu-items.component').then(
            (module) => module.MenuItemsComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/orders.component').then((module) => module.OrdersComponent),
      },
      {
        path: 'cash-register',
        loadComponent: () =>
          import('./pages/cash-register/cash-register.component').then(
            (module) => module.CashRegisterComponent,
          ),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
