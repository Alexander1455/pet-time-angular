// ============================================================
// app.routes.ts — Configuración de rutas con Lazy Loading
// ============================================================

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta raíz → redirige al login
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // ── Rutas públicas (Auth) — con Lazy Loading ─────────────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Rutas privadas (App) — protegidas por AuthGuard ──────
  {
    path: 'app',
    canActivate: [authGuard], // 🔒 Protección de rutas privadas
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointments.component').then(m => m.AppointmentsComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history.component').then(m => m.HistoryComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Wildcard — cualquier ruta desconocida va al login
  { path: '**', redirectTo: 'auth/login' },
];
