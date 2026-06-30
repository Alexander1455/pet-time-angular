// ============================================================
// modal.component.ts
// Componente modal genérico reutilizable.
// Usa ng-content para proyección de contenido dinámico.
// ============================================================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ModalComponent
 * Modal genérico que aparece desde abajo (bottom sheet).
 * Usa ng-content para permitir cualquier contenido interno.
 *
 * @Input()  title  — título del modal
 * @Output() closed — emite cuando el modal se cierra
 *
 * Uso:
 *   <app-modal title="Mi Título" (closed)="onClose()">
 *     <p>Contenido del modal</p>
 *   </app-modal>
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay -->
    <div
      class="modal-overlay d-flex align-items-end justify-content-center"
      (click)="onOverlayClick($event)">

      <!-- Panel del modal -->
      <div class="modal-panel bg-white p-4 animate-slideUp">
        <!-- Cabecera con título y botón cerrar -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="mb-0 fw-bold" style="color:#1a1a2e;">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Cerrar"
            (click)="closed.emit()">
          </button>
        </div>

        <!-- Contenido dinámico vía ng-content (proyección de contenido) -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1050;
    }
    .modal-panel {
      border-radius: 24px 24px 0 0;
      width: 100%;
      max-width: 430px;
      max-height: 90vh;
      overflow-y: auto;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `],
})
export class ModalComponent {
  /** Título del modal */
  @Input() title = '';
  /** Emite cuando el usuario cierra el modal */
  @Output() closed = new EventEmitter<void>();

  /** Cierra el modal si el click es en el overlay (no en el panel) */
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closed.emit();
    }
  }
}
