// ============================================================
// appointment-status.pipe.ts
// Pipe personalizado que transforma el status interno (en inglés)
// a su representación visual en español.
//
// EVIDENCIA ACADÉMICA: Pipe personalizado requerido por la rúbrica.
// ============================================================

import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../models/appointment.model';

/**
 * AppointmentStatusPipe
 * Transforma el status de una cita a su etiqueta en español.
 *
 * Uso en template:
 *   {{ appointment.status | appointmentStatus }}
 *
 * Ejemplos:
 *   'pending'   → 'Pendiente'
 *   'confirmed' → 'Confirmada'
 *   'completed' → 'Completada'
 *   'cancelled' → 'Cancelada'
 */
@Pipe({
  name: 'appointmentStatus',
  standalone: true,
  pure: true, // pipe puro: solo se recalcula si cambia el valor de entrada
})
export class AppointmentStatusPipe implements PipeTransform {

  /** Mapa de status en inglés → etiqueta en español */
  private readonly statusMap: Record<AppointmentStatus, string> = {
    pending:   'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  /**
   * Transforma el status de la cita a su etiqueta en español.
   * @param value — AppointmentStatus (pending | confirmed | completed | cancelled)
   * @returns string en español, o el valor original si no se reconoce
   */
  transform(value: AppointmentStatus | string): string {
    return this.statusMap[value as AppointmentStatus] ?? value;
  }
}

/**
 * StatusBadgeClassPipe
 * Pipe auxiliar que retorna la clase CSS Bootstrap para el badge de estado.
 *
 * Uso en template:
 *   [class]="appointment.status | statusBadgeClass"
 */
@Pipe({
  name: 'statusBadgeClass',
  standalone: true,
  pure: true,
})
export class StatusBadgeClassPipe implements PipeTransform {

  private readonly classMap: Record<AppointmentStatus, string> = {
    pending:   'badge bg-warning text-dark',
    confirmed: 'badge bg-primary',
    completed: 'badge bg-success',
    cancelled: 'badge bg-danger',
  };

  transform(value: AppointmentStatus | string): string {
    return this.classMap[value as AppointmentStatus] ?? 'badge bg-secondary';
  }
}
