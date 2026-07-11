// ============================================================
// appointment.service.ts
// Servicio para gestión de citas en PetTime.
// Maneja tanto las citas activas como el historial de atenciones.
// Soporta filtros por rol (cliente vs. doctor).
// ============================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment, AppointmentStatus, MedicalRecord } from '../../models/appointment.model';

const APPOINTMENTS_KEY = 'pettime_appointments_state';
const HISTORY_KEY      = 'pettime_history_state';

const VET_NAME    = 'PetTime Clínica Central';
const VET_ADDRESS = 'Av. Javier Prado Este 1234, San Isidro';

/** Citas de ejemplo pre-cargadas */
const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    service: 'Baño y Secado',
    pet: 'Max',
    petId: 1,
    ownerName: 'Alexander',
    ownerEmail: 'alexander@pettime.com',
    date: '2026-12-20',
    time: '09:00 AM',
    status: 'pending',
    icon: '🛁',
    vet: VET_NAME,
    address: VET_ADDRESS,
    doctorId: 'doc-4',
    doctorName: 'Dra. Sofía Paredes',
  },
  {
    id: 2,
    service: 'Vacuna Antirrábica',
    pet: 'Luna',
    petId: 2,
    ownerName: 'Alexander',
    ownerEmail: 'alexander@pettime.com',
    date: '2026-12-22',
    time: '10:00 AM',
    status: 'confirmed',
    icon: '💉',
    vet: VET_NAME,
    address: VET_ADDRESS,
    doctorId: 'doc-2',
    doctorName: 'Dra. Laura Méndez',
  },
];

/** Historial de ejemplo pre-cargado */
const DEFAULT_HISTORY: Appointment[] = [
  {
    id: 10,
    service: 'Consulta General',
    pet: 'Max',
    petId: 1,
    ownerName: 'Alexander',
    ownerEmail: 'alexander@pettime.com',
    date: '2026-03-01',
    time: '09:00 AM',
    status: 'completed',
    icon: '🩺',
    vet: VET_NAME,
    address: VET_ADDRESS,
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlos Rojas',
    medicalRecord: {
      treatment: 'Revisión clínica completa, palpación abdominal y auscultación cardiaca',
      medications: 'Vitamina B12 inyectable 1ml, suplemento omega-3',
      reactions: 'Sin reacciones adversas observadas',
      recommendations: 'Alimentación balanceada, paseo diario de 30 minutos. Control en 3 meses.',
      attendedAt: '2026-03-01 09:45 AM',
    },
  },
  {
    id: 11,
    service: 'Desparasitación',
    pet: 'Luna',
    petId: 2,
    ownerName: 'Alexander',
    ownerEmail: 'alexander@pettime.com',
    date: '2026-02-15',
    time: '10:00 AM',
    status: 'completed',
    icon: '💊',
    vet: VET_NAME,
    address: VET_ADDRESS,
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlos Rojas',
    medicalRecord: {
      treatment: 'Desparasitación interna y externa completa',
      medications: 'Milbemax 1 comprimido oral, Frontline spray 250ml aplicado en lomo y cuello',
      reactions: 'Ligera somnolencia post-administración, normalizada en 2 horas',
      recommendations: 'Repetir en 30 días. Evitar contacto con otros animales por 48 horas.',
      attendedAt: '2026-02-15 10:30 AM',
    },
  },
  {
    id: 12,
    service: 'Baño y Secado',
    pet: 'Max',
    petId: 1,
    ownerName: 'Alexander',
    ownerEmail: 'alexander@pettime.com',
    date: '2026-01-28',
    time: '03:00 PM',
    status: 'cancelled',
    icon: '🛁',
    vet: VET_NAME,
    address: VET_ADDRESS,
    doctorId: 'doc-4',
    doctorName: 'Dra. Sofía Paredes',
  },
  {
    id: 13,
    service: 'Consulta General',
    pet: 'Toby',
    petId: 3,
    ownerName: 'María Gómez',
    ownerEmail: 'maria.gomez@gmail.com',
    date: '2026-05-12',
    time: '11:00 AM',
    status: 'completed',
    icon: '🩺',
    vet: VET_NAME,
    address: VET_ADDRESS,
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlos Rojas',
    medicalRecord: {
      treatment: 'Examen físico general, limpieza de oídos',
      medications: 'Gotas otológicas Otovet 3 gotas por 5 días',
      reactions: 'Ninguna',
      recommendations: 'Limpieza periódica de orejas después del baño. Control en 6 meses.',
      attendedAt: '2026-05-12 11:40 AM',
    },
  },
  {
    id: 14,
    service: 'Consulta General',
    pet: 'Mimi',
    petId: 4,
    ownerName: 'María Gómez',
    ownerEmail: 'maria.gomez@gmail.com',
    date: '2026-06-01',
    time: '04:00 PM',
    status: 'completed',
    icon: '🩺',
    vet: VET_NAME,
    address: VET_ADDRESS,
    doctorId: 'doc-1',
    doctorName: 'Dr. Carlos Rojas',
    medicalRecord: {
      treatment: 'Revisión por pérdida de apetito. Toma de temperatura.',
      medications: 'Complejo B inyectable, estimulante del apetito jarabe',
      reactions: 'Somnolencia leve',
      recommendations: 'Ofrecer comida húmeda tibia. Reposo.',
      attendedAt: '2026-06-01 04:30 PM',
    },
  },
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

  // ── Métodos filtrados por Rol ─────────────────────────────

  /** Citas filtradas por doctor (para el panel del doctor) */
  getDoctorAppointments(doctorId: string): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map(apts => apts.filter(a => a.doctorId === doctorId))
    );
  }

  /** Historial filtrado por doctor */
  getDoctorHistory(doctorId: string): Observable<Appointment[]> {
    return this.history$.pipe(
      map(h => h.filter(a => a.doctorId === doctorId))
    );
  }

  /** Obtiene los horarios ya reservados para un doctor en una fecha específica */
  getBookedTimesForDoctor(doctorId: string, date: string): string[] {
    return this.appointmentsSubject.value
      .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
      .map(a => a.time);
  }

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
   * Registra la ficha clínica de una cita y la mueve al historial como 'completed'.
   * Llamado por el doctor al terminar la atención.
   */
  registerMedicalRecord(appointmentId: number, record: MedicalRecord): void {
    const apt = this.appointmentsSubject.value.find(a => a.id === appointmentId);
    if (!apt) return;

    const updatedApt: Appointment = { ...apt, status: 'completed', medicalRecord: record };
    const updatedApts = this.appointmentsSubject.value.filter(a => a.id !== appointmentId);
    const updatedHistory = [...this.historySubject.value, updatedApt];

    this.updateAppointments(updatedApts);
    this.updateHistory(updatedHistory);
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
