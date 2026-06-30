// ============================================================
// app.component.ts — Componente raíz de la aplicación
// ============================================================

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * AppComponent
 * Componente raíz. Solo contiene el <router-outlet> que Angular
 * usa para renderizar el componente activo según la ruta actual.
 * El layout y la navegación se manejan en cada feature component.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
