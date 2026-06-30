// ============================================================
// auth.guard.ts
// Guard de autenticación para proteger rutas privadas.
// Si el usuario no está autenticado, redirige a /auth/login.
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * authGuard
 * Guard funcional de Angular 19 (sin clase).
 * Verifica si hay un usuario autenticado antes de activar la ruta.
 * Si no hay sesión activa, redirige a /auth/login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirige al login si no hay sesión activa
  return router.createUrlTree(['/auth/login']);
};
