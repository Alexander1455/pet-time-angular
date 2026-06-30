// ============================================================
// service-card.component.ts
// Componente reutilizable de tarjeta para mostrar una cita.
// Usa @Input() para recibir datos y @Output() para emitir acciones.
// Integra los pipes y directivas personalizados.
// ============================================================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentStatusPipe, StatusBadgeClassPipe } from '../../pipes/appointment-status.pipe';
import { HighlightAppointmentDirective } from '../../directives/highlight-appointment.directive';

/**
 * ServiceCardComponent
 * Tarjeta reutilizable que muestra los datos de una cita.
 * Se usa en: Dashboard (próximas citas), History (historial).
 *
 * @Input()  appointment — datos de la cita
 * @Input()  actionLabel — texto del botón de acción (opcional)
 * @Output() action      — emite el ID de la cita al hacer click en el botón
 */
@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [
    CommonModule,
    AppointmentStatusPipe,
    StatusBadgeClassPipe,
    HighlightAppointmentDirective,
  ],
  template: `
    <div
      class="card shadow-sm mb-3 border-0"
      [appHighlightAppointment]="appointment.date"
      style="border-radius: 14px; overflow: hidden;">

      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">

          <!-- Ícono del servicio -->
          <div
            class="d-flex align-items-center justify-content-center flex-shrink-0"
            style="width:52px; height:52px; border-radius:14px; background:rgba(50,172,220,0.10); font-size:24px;">
            {{ appointment.icon }}
          </div>

          <!-- Información de la cita -->
          <div class="flex-grow-1 min-width-0">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h6 class="mb-0 fw-bold text-truncate appt-title" style="color:#1a1a2e; font-size:14px;">
                {{ appointment.service }}
              </h6>
              <!-- Badge de estado usando AppointmentStatusPipe + StatusBadgeClassPipe -->
              <span [class]="appointment.status | statusBadgeClass" style="font-size:11px; white-space:nowrap;">
                {{ appointment.status | appointmentStatus }}
              </span>
            </div>

            <p class="mb-1 small" style="color:#6c757d;">🐾 {{ appointment.pet }}</p>
            <p class="mb-1 small" style="color:#6c757d;">📅 {{ appointment.date }}&nbsp;⏰ {{ appointment.time }}</p>
            <p class="mb-0 small" style="color:#6c757d;">📍 {{ appointment.vet }}</p>

            <!-- Dirección (si existe) -->
            <p *ngIf="appointment.address" class="mb-0 small fw-medium" style="color:#32ACDC; font-size:11px; margin-top:2px;">
              🗺 {{ appointment.address }}
            </p>
          </div>
        </div>

        <!-- Botón de acción opcional -->
        <button
          *ngIf="actionLabel"
          type="button"
          class="btn btn-outline-primary btn-sm w-100 mt-3"
          style="border-radius:10px; font-size:13px; font-weight:600;"
          (click)="action.emit(appointment.id)">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
})
export class ServiceCardComponent {
  /** Datos completos de la cita a mostrar */
  @Input({ required: true }) appointment!: Appointment;
  /** Texto del botón de acción. Si no se pasa, el botón no se muestra. */
  @Input() actionLabel = '';
  /** Emite el ID de la cita cuando se hace click en el botón de acción */
  @Output() action = new EventEmitter<number>();
}
