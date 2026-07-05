// ============================================================
// bottom-nav.component.ts
// Barra de navegación inferior para las rutas privadas.
// Aparece en todas las páginas del área protegida.
// ============================================================

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

/**
 * BottomNavComponent
 * Barra de navegación inferior fija con 4 ítems de navegación.
 * Usa routerLinkActive para resaltar la ruta activa.
 */
@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bottom-nav d-flex justify-content-around align-items-center py-2 bg-white border-top">
      <a
        *ngFor="let item of navItems"
        [routerLink]="item.path"
        routerLinkActive="active"
        class="nav-item d-flex flex-column align-items-center text-decoration-none gap-1 px-3 py-1"
        style="min-width: 64px;">

        <!-- Ícono Bootstrap Icon -->
        <i [class]="'bi ' + item.icon" style="font-size: 22px;"></i>
        <!-- Etiqueta -->
        <span style="font-size: 11px; font-weight: 500;">{{ item.label }}</span>
        <!-- Indicador activo (punto) -->
        <div class="nav-dot"></div>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 100;
      box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
    }

    .nav-item {
      color: #adb5bd;
      transition: color 0.2s;
    }

    .nav-item.active {
      color: #32ACDC;
    }

    .nav-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: transparent;
      transition: background 0.2s;
    }

    .nav-item.active .nav-dot {
      background: #32ACDC;
    }

    /* Ocultar en pantallas de escritorio */
    @media (min-width: 768px) {
      .bottom-nav {
        display: none !important;
      }
    }
  `],
})
export class BottomNavComponent {
  readonly navItems: NavItem[] = [
    { path: '/app/dashboard',    label: 'Inicio',    icon: 'bi-house-fill' },
    { path: '/app/appointments', label: 'Servicios', icon: 'bi-calendar2-heart' },
    { path: '/app/history',      label: 'Historial', icon: 'bi-clock-history' },
    { path: '/app/profile',      label: 'Perfil',    icon: 'bi-person-circle' },
  ];
}
