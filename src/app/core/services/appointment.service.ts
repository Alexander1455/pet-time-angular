// ============================================================
// appointment.service.ts
// Servicio para gestión de citas en PetTime.
// Maneja tanto las citas activas como el historial de atenciones.
//
// REEMPLAZA: AppContext (ADD_APPOINTMENT, CONFIRM, COMPLETE, CANCEL actions)
// ============================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

const APPOINTMENTS_KEY = 'pettime_appointments_state';
const HISTORY_KEY      = 'pettime_history_state';

/** Citas de ejemplo pre-cargadas */
const DEFAULT_APPOINTMENTS: Appointment[] = [
  { id: 1, service: 'Baño y Corte',        pet: 'Max',  date: '2026-12-20', time: '10:00 AM', status: 'pending',   icon: '🛁', vet: 'Pettime Miraflores', address: 'Av. Larco 450, Miraflores' },
  { id: 2, service: 'Vacuna Antirrábica',  pet: 'Luna', date: '2026-12-22', time: '02:00 PM', status: 'confirmed', icon: '💉', vet: 'Pettime San Isidro',  address: 'Calle Los Laureles 365, San Isidro' },
];

/** Historial de ejemplo pre-cargado */
const DEFAULT_HISTORY: Appointment[] = [
  { id: 10, service: 'Consulta General',  pet: 'Max',  date: '2026-03-01', time: '09:00 AM', status: 'completed', icon: '🩺', vet: 'Pettime Miraflores', address: 'Av. Larco 450, Miraflores' },
  { id: 11, service: 'Desparasitación',   pet: 'Luna', date: '2026-02-15', time: '11:00 AM', status: 'completed', icon: '💊', vet: 'Pettime San Isidro',  address: 'Calle Los Laureles 365, San Isidro' },
  { id: 12, service: 'Baño y Corte',      pet: 'Max',  date: '2026-01-28', time: '03:00 PM', status: 'cancelled', icon: '🛁', vet: 'Pettime Surco',       address: 'Av. Primavera 890, Santiago de Surco' },
];

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  // ── Estado privado (ENCAPSULAMIENTO) ──────────────────────
  private readonly appointmentsSubject = new BehaviorSubject<Appointment[]>(
    this.loadFromStorage(APPOINTMENTS_KEY, DEFAULT_APPOINTMENTS)
  );

  private readonly historySubject = new BehaviorSubject<Appointment[]>(
    this.loadFromStorage(HISTORY_KEY, DEFAULT_HISTORY)
  );

  // ── Observables públicos ──────────────────────────────────

  readonly appointments$: Observable<Appointment[]> = this.appointmentsSubject.asObservable();
  readonly history$: Observable<Appointment[]>      = this.historySubject.asObservable();

  /** Solo citas pendientes o confirmadas (para el dashboard) */
  readonly upcoming$: Observable<Appointment[]> = this.appointments$.pipe(
    map(apts => apts.filter(a => a.status === 'pending' || a.status === 'confirmed'))
  );

  /** Conteo de citas activas (para estadísticas del perfil) */
  readonly appointmentsCount$: Observable<number> = this.appointments$.pipe(
    map(apts => apts.length)
  );

  /** Conteo de citas completadas (para estadísticas del perfil) */
  readonly completedCount$: Observable<number> = this.history$.pipe(
    map(h => h.filter(a => a.status === 'completed').length)
  );

  // ── Getters síncronos ─────────────────────────────────────

  get appointments(): Appointment[] { return this.appointmentsSubject.value; }
  get history(): Appointment[] { return this.historySubject.value; }

  // ── Métodos de gestión ─────────────────────────────────────

  /**
   * Agrega una nueva cita al estado de citas activas.
   * Toda cita nueva comienza en estado 'pending'.
   */
  addAppointment(appointment: Appointment): void {
    const updated = [...this.appointmentsSubject.value, appointment];
    this.updateAppointments(updated);
  }

  /**
   * Cambia el estado de una cita de 'pending' a 'confirmed'.
   */
  confirmAppointment(id: number): void {
    this.changeStatus(id, 'confirmed');
  }

  /**
   * Mueve la cita del estado activo al historial con estado 'completed'.
   */
  completeAppointment(id: number): void {
    this.moveToHistory(id, 'completed');
  }

  /**
   * Mueve la cita del estado activo al historial con estado 'cancelled'.
   */
  cancelAppointment(id: number): void {
    this.moveToHistory(id, 'cancelled');
  }

  /**
   * Filtra el historial por estado.
   */
  getFilteredHistory(filter: 'todos' | AppointmentStatus): Observable<Appointment[]> {
    return this.history$.pipe(
      map(history => filter === 'todos' ? history : history.filter(h => h.status === filter))
    );
  }

  /**
   * Resetea el estado de citas e historial (usado en logout).
   */
  reset(): void {
    this.updateAppointments(DEFAULT_APPOINTMENTS);
    this.updateHistory(DEFAULT_HISTORY);
  }

  // ── Métodos privados ──────────────────────────────────────

  /** Cambia el status de una cita sin moverla al historial */
  private changeStatus(id: number, status: AppointmentStatus): void {
    const updated = this.appointmentsSubject.value.map(a =>
      a.id === id ? { ...a, status } : a
    );
    this.updateAppointments(updated);
  }

  /** Mueve una cita del array activo al historial */
  private moveToHistory(id: number, status: AppointmentStatus): void {
    const apt = this.appointmentsSubject.value.find(a => a.id === id);
    if (!apt) return;

    const updatedApts = this.appointmentsSubject.value.filter(a => a.id !== id);
    const updatedHistory = [...this.historySubject.value, { ...apt, status }];

    this.updateAppointments(updatedApts);
    this.updateHistory(updatedHistory);
  }

  private updateAppointments(appointments: Appointment[]): void {
    this.appointmentsSubject.next(appointments);
    this.saveToStorage(APPOINTMENTS_KEY, appointments);
  }

  private updateHistory(history: Appointment[]): void {
    this.historySubject.next(history);
    this.saveToStorage(HISTORY_KEY, history);
  }

  private loadFromStorage<T>(key: string, defaults: T[]): T[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T[] : defaults;
    } catch {
      return defaults;
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      console.warn(`No se pudo guardar ${key} en localStorage`);
    }
  }
}
