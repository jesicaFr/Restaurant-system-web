import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    MatSidenavModule, 
    MatToolbarModule, 
    MatListModule, 
    MatIconModule, 
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="app-shell">
      <mat-sidenav #snav [mode]="isSmall ? 'over' : 'side'" [opened]="!isSmall" class="sidebar">
        <div class="brand">
          <span class="brand-icon">🍴</span>
          <span>Restaurante</span>
        </div>
        
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/tables" routerLinkActive="active">
            <mat-icon>table_restaurant</mat-icon>
            <span>Mesas</span>
          </a>
          <a mat-list-item routerLink="/menu-items" routerLinkActive="active">
            <mat-icon>restaurant_menu</mat-icon>
            <span>Menú</span>
          </a>
          <a mat-list-item routerLink="/orders" routerLinkActive="active">
            <mat-icon>receipt_long</mat-icon>
            <span>Pedidos</span>
          </a>
          <a mat-list-item routerLink="/cash-register" routerLinkActive="active">
            <mat-icon>attach_money</mat-icon>
            <span>Caja</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="main-content-container">
        <mat-toolbar class="topbar">
          <button mat-icon-button (click)="snav.toggle()" *ngIf="isSmall">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Sistema de gestión de restaurante</span>
        </mat-toolbar>
        
        <div class="content app-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
  `
  /* Shell base */
  .app-shell { 
    height: 100vh; 
    background-color: #F8F4EF;
  }

  .main-content-container {
    background-color: #F8F4EF;
  }
  
  /* Sidebar principal */
  .sidebar { 
    width: 240px; 
    padding: 1.5rem 1rem; 
    background: #2C211F !important; 
    color: #fff; 
    border-right: none !important;
    box-shadow: inset -1px 0 0 rgba(255,255,255,0.06); 
  }
  
  /* Brand / Logo superior */
  .brand { 
    font-size: 1.2rem; 
    font-weight: 700; 
    padding: 0 0.5rem 1.75rem; 
    display: flex; 
    align-items: center; 
    gap: 0.75rem; 
    font-family: 'Roboto', sans-serif; 
    color: #ffffff !important; 
  }

  .brand-icon { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    width: 36px; 
    height: 36px; 
    border-radius: 10px; 
    background: rgba(255,255,255,0.08); 
    font-size: 1.1rem;
  }
  
  /* Contenedor de la lista */
  mat-nav-list { 
    margin-top: 0.5rem; 
    padding: 0 !important; 
  }
  
  /* RESET COMPLETO DE VARIABLES MATERIAL MDC */
  ::ng-deep a.mat-mdc-list-item {
    --mdc-list-item-container-color: transparent !important;
    --mdc-list-item-hover-container-color: transparent !important;
    --mdc-list-item-focus-container-color: transparent !important;
    --mdc-list-item-selected-container-color: transparent !important;
    --mdc-list-item-activated-container-color: transparent !important;
    
    border-radius: 10px !important; 
    margin: 0.35rem 0 !important; 
    transition: all 0.2s ease !important; 
    border: 1px solid transparent !important;
    height: 48px !important;
    background: transparent !important;
  }

  /* Eliminar overlays y pseudo-elementos de Material */
  ::ng-deep a.mat-mdc-list-item .mdc-list-item__ripple,
  ::ng-deep a.mat-mdc-list-item .mat-mdc-focus-indicator,
  ::ng-deep a.mat-mdc-list-item::before,
  ::ng-deep a.mat-mdc-list-item::after {
    display: none !important;
    opacity: 0 !important;
  }

  /* Forzar alineación de contenido e icono */
  ::ng-deep a.mat-mdc-list-item .mdc-list-item__start,
  ::ng-deep a.mat-mdc-list-item .mdc-list-item__content {
    display: inline-flex !important;
    align-items: center !important;
  }

  ::ng-deep a.mat-mdc-list-item mat-icon {
    margin-right: 14px !important;
    color: #C5BBB7 !important;
    font-size: 1.35rem !important;
    width: 24px !important;
    height: 24px !important;
  }

  ::ng-deep a.mat-mdc-list-item .mdc-list-item__primary-text { 
    color: #C5BBB7 !important; 
    font-size: 0.95rem !important;
    font-weight: 500 !important;
  }
  
  /* Hover */
  ::ng-deep a.mat-mdc-list-item:hover { 
    background: rgba(255, 255, 255, 0.05) !important; 
  }

  ::ng-deep a.mat-mdc-list-item:hover .mdc-list-item__primary-text,
  ::ng-deep a.mat-mdc-list-item:hover mat-icon { 
    color: #ffffff !important; 
  }
  
  /* Estado Activo (Borde fino y suave) */
  ::ng-deep a.mat-mdc-list-item.active { 
    background: rgba(255, 255, 255, 0.04) !important; 
    border: 1px solid #6B5B53 !important; 
    border-radius: 10px !important;
  }

  ::ng-deep a.mat-mdc-list-item.active .mdc-list-item__primary-text,
  ::ng-deep a.mat-mdc-list-item.active mat-icon { 
    color: #ffffff !important; 
    font-weight: 600 !important;
  }
  
  /* Topbar superior */
  .topbar { 
    height: 56px; 
    background: #2C211F; 
    color: #fff; 
    padding-left: 1.5rem; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.06); 
  }

  .topbar button { margin-right: 0.5rem; }
  .topbar span { font-family: 'Roboto', sans-serif; font-size: 0.95rem; font-weight: 500; opacity: 0.9; }
  
  .content { padding: 1.75rem; }
  .app-content { max-width: 1200px; margin: 0 auto; }
  `
]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSmall = false;
  private sub: Subscription | null = null;

  constructor(private readonly bp: BreakpointObserver) {}

  ngOnInit(): void {
    this.sub = this.bp.observe(['(max-width: 800px)']).subscribe((r) => {
      this.isSmall = r.matches;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}