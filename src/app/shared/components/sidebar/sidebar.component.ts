// ============================================================
// sidebar.component.ts
// Barra de navegación lateral para pantallas de escritorio.
// Solo visible en pantallas >= 768px.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models/user.model';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar d-none d-md-flex flex-column">
      <!-- Logo -->
      <div class="sidebar-logo">
        <img src="/Logo-PetTime.svg" alt="PetTime" style="height:38px;filter:brightness(10);" onerror="this.style.display='none'">
        <span class="sidebar-brand">PetTime</span>
      </div>

      <!-- Perfil compacto -->
      <div class="sidebar-profile" *ngIf="user$ | async as user">
        <div class="sidebar-avatar">{{ user.avatar }}</div>
        <div class="sidebar-profile-info">
          <p class="sidebar-profile-name">{{ user.name }}</p>
          <span class="sidebar-role-badge" [class.doctor]="user.role === 'doctor'">
            {{ user.role === 'doctor' ? '🩺 Veterinario' : '🐾 Dueño' }}
          </span>
        </div>
      </div>

      <!-- Separador -->
      <div class="sidebar-divider"></div>

      <!-- Navegación -->
      <nav class="sidebar-nav flex-grow-1">
        <a *ngFor="let item of navItems"
          [routerLink]="item.path"
          routerLinkActive="active"
          class="sidebar-nav-item">
          <i [class]="'bi ' + item.icon + ' sidebar-icon'"></i>
          <span class="sidebar-label">{{ item.label }}</span>
        </a>
      </nav>

      <!-- Separador -->
      <div class="sidebar-divider"></div>

      <!-- Footer info -->
      <div class="sidebar-footer">
        <div class="sidebar-clinic">
          <i class="bi bi-geo-alt-fill" style="color:#32ACDC;font-size:13px;"></i>
          <span>PetTime Clínica Central</span>
        </div>
        <p class="sidebar-clinic-addr">Av. Javier Prado Este 1234, San Isidro</p>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 240px;
      background: linear-gradient(160deg, #1a2a3a 0%, #0d1b2a 100%);
      z-index: 200;
      padding: 0;
      box-shadow: 4px 0 20px rgba(0,0,0,0.15);
      overflow-y: auto;
      flex-direction: column;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 24px 20px 20px;
    }

    .sidebar-brand {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
    }

    .sidebar-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px 16px;
    }

    .sidebar-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #32ACDC, #1a8ab5);
      color: #fff;
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 3px 10px rgba(50,172,220,0.4);
    }

    .sidebar-profile-info {
      flex: 1;
      min-width: 0;
    }

    .sidebar-profile-name {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-role-badge {
      display: inline-block;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 20px;
      background: rgba(50,172,220,0.2);
      color: #32ACDC;
      font-weight: 600;
      margin-top: 2px;
    }

    .sidebar-role-badge.doctor {
      background: rgba(25,135,84,0.2);
      color: #5cbb89;
    }

    .sidebar-divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 4px 20px;
    }

    .sidebar-nav {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sidebar-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 12px;
      text-decoration: none;
      color: rgba(255,255,255,0.55);
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .sidebar-nav-item:hover {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.9);
    }

    .sidebar-nav-item.active {
      background: rgba(50,172,220,0.18);
      color: #32ACDC;
      font-weight: 600;
    }

    .sidebar-icon {
      font-size: 18px;
      width: 22px;
      text-align: center;
    }

    .sidebar-label {
      font-size: 14px;
    }

    .sidebar-footer {
      padding: 16px 20px;
    }

    .sidebar-clinic {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 3px;
    }

    .sidebar-clinic-addr {
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      margin: 0;
    }
  `],
})
export class SidebarComponent {
  user$: Observable<User | null>;

  readonly navItems: NavItem[] = [
    { path: '/app/dashboard',    label: 'Inicio',    icon: 'bi-house-fill' },
    { path: '/app/appointments', label: 'Servicios', icon: 'bi-calendar2-heart' },
    { path: '/app/history',      label: 'Historial', icon: 'bi-clock-history' },
    { path: '/app/profile',      label: 'Perfil',    icon: 'bi-person-circle' },
  ];

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
  }
}
