// ============================================================
// doctor.service.ts
// Servicio para gestión de doctores / veterinarios en PetTime.
// Persiste en localStorage y provee doctores de ejemplo.
// ============================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Doctor, DoctorSpecialty, DEFAULT_DOCTORS } from '../../models/doctor.model';

const DOCTORS_KEY = 'pettime_doctors_state';

@Injectable({ providedIn: 'root' })
export class DoctorService {

  // ── Estado privado ────────────────────────────────────────
  private readonly doctorsSubject = new BehaviorSubject<Doctor[]>(this.loadDoctors());

  // ── Observables públicos ──────────────────────────────────

  /** Stream reactivo de la lista de doctores */
  readonly doctors$: Observable<Doctor[]> = this.doctorsSubject.asObservable();

  // ── Getters síncronos ─────────────────────────────────────

  get doctors(): Doctor[] { return this.doctorsSubject.value; }

  // ── Métodos públicos ──────────────────────────────────────

  /**
   * Retorna todos los doctores disponibles para una especialidad.
   * Si la especialidad es 'Todos', devuelve todos los doctores.
   */
  getDoctorsBySpecialty(specialty: DoctorSpecialty): Doctor[] {
    return this.doctorsSubject.value.filter(
      d => d.specialty === specialty || d.specialty === 'Todos'
    );
  }

  /**
   * Retorna los horarios disponibles de un doctor para una fecha específica,
   * descontando las horas que ya están reservadas ese día.
   */
  getAvailableSlots(doctorId: string, date: string, bookedTimes: string[]): string[] {
    const doctor = this.findById(doctorId);
    if (!doctor) return [];
    return doctor.availabilities.filter(slot => !bookedTimes.includes(slot));
  }

  /**
   * Agrega un nuevo doctor al sistema.
   */
  addDoctor(doctor: Doctor): void {
    const updated = [...this.doctorsSubject.value, doctor];
    this.doctorsSubject.next(updated);
    this.saveDoctors(updated);
  }

  /**
   * Busca un doctor por su ID.
   */
  findById(id: string): Doctor | undefined {
    return this.doctorsSubject.value.find(d => d.id === id);
  }

  /**
   * Busca un doctor por su correo electrónico.
   */
  findByEmail(email: string): Doctor | undefined {
    return this.doctorsSubject.value.find(d => d.email.toLowerCase() === email.toLowerCase());
  }

  // ── Métodos privados ──────────────────────────────────────

  private loadDoctors(): Doctor[] {
    try {
      const raw = localStorage.getItem(DOCTORS_KEY);
      return raw ? JSON.parse(raw) as Doctor[] : DEFAULT_DOCTORS;
    } catch {
      return DEFAULT_DOCTORS;
    }
  }

  private saveDoctors(doctors: Doctor[]): void {
    try {
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    } catch {
      console.warn('No se pudo guardar doctores en localStorage');
    }
  }
}
