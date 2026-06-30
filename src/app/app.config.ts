// ============================================================
// app.config.ts — Configuración de la aplicación Angular
// ============================================================

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Detección de cambios optimizada con Zone.js
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router con configuración de scroll al tope en cada navegación
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    // HttpClient para futuras integraciones con API REST
    provideHttpClient(),
  ],
};
