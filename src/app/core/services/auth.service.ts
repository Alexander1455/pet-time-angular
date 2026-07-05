// ============================================================
// auth.service.ts
// Servicio de autenticación de PetTime.
// Gestiona el estado del usuario autenticado usando BehaviorSubject
// y persiste la sesión en localStorage.
// Soporta roles: 'client' (dueño de mascota) y 'doctor' (veterinario).
// ============================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginCredentials, RegisterData, DoctorRegisterData } from '../../models/user.model';
import { DoctorService } from './doctor.service';
import { Doctor, DEFAULT_DOCTORS } from '../../models/doctor.model';

const AUTH_KEY = 'pettime_auth_state';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── Estado privado (ENCAPSULAMIENTO) ──────────────────────
  /** Usuario actualmente autenticado. null si no hay sesión. */
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());

  // ── Observables públicos ──────────────────────────────────

  /** Stream reactivo del usuario actual */
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  /** Stream reactivo del estado de autenticación */
  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map(user => user !== null)
  );

  /** Stream reactivo del rol del usuario */
  readonly userRole$: Observable<'client' | 'doctor' | null> = this.currentUser$.pipe(
    map(user => user?.role ?? null)
  );

  /** Verdadero si el usuario actual es doctor */
  readonly isDoctor$: Observable<boolean> = this.currentUser$.pipe(
    map(user => user?.role === 'doctor')
  );

  constructor(private readonly doctorService: DoctorService) {}

  // ── Getters síncronos ─────────────────────────────────────

  /** Retorna el usuario actual de forma síncrona */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** Retorna true si hay un usuario autenticado */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /** Retorna true si el usuario actual es doctor */
  isDoctor(): boolean {
    return this.currentUserSubject.value?.role === 'doctor';
  }

  // ── Métodos de sesión ─────────────────────────────────────

  /**
   * Simula el inicio de sesión con email y contraseña.
   * Detecta automáticamente si el email corresponde a un doctor registrado.
   */
  async login(credentials: LoginCredentials): Promise<void> {
    await this.delay(1000);

    // Verificar si el email corresponde a un doctor
    const doctor = this.doctorService.findByEmail(credentials.email);

    if (doctor) {
      // Login como Doctor
      const user: User = {
        name: doctor.name,
        email: doctor.email,
        avatar: doctor.name[0].toUpperCase(),
        role: 'doctor',
        specialty: doctor.specialty,
        doctorId: doctor.id,
      };
      this.setUser(user);
    } else {
      // Login como Cliente
      const user: User = {
        name: credentials.email.split('@')[0],
        email: credentials.email,
        avatar: credentials.email[0].toUpperCase(),
        role: 'client',
      };
      this.setUser(user);
    }
  }

  /**
   * Simula el registro de un nuevo cliente (dueño de mascota).
   */
  async register(data: RegisterData): Promise<void> {
    await this.delay(1200);

    const user: User = {
      name: `${data.nombres} ${data.apellidos}`,
      email: data.email,
      avatar: data.nombres[0].toUpperCase(),
      role: 'client',
      nombres: data.nombres,
      apellidos: data.apellidos,
      dni: data.dni,
      telefono: data.telefono,
      genero: data.genero,
    };

    this.setUser(user);
  }

  /**
   * Registra un nuevo doctor/veterinario en el sistema.
   */
  async registerDoctor(data: DoctorRegisterData): Promise<void> {
    await this.delay(1200);

    const doctorId = `doc-${Date.now()}`;

    // Crear el doctor en el servicio de doctores
    const newDoctor: Doctor = {
      id: doctorId,
      name: `${data.nombres} ${data.apellidos}`,
      email: data.email,
      password: data.password,
      specialty: data.specialty as Doctor['specialty'],
      availabilities: data.availabilities,
    };
    this.doctorService.addDoctor(newDoctor);

    // Iniciar sesión automáticamente como doctor
    const user: User = {
      name: newDoctor.name,
      email: newDoctor.email,
      avatar: data.nombres[0].toUpperCase(),
      role: 'doctor',
      specialty: data.specialty,
      doctorId: doctorId,
    };
    this.setUser(user);
  }

  /**
   * Cambia el rol de sesión para demostración (Demo Switcher).
   * No afecta los datos del sistema — solo cambia la perspectiva activa.
   */
  switchDemoRole(targetRole: 'client' | 'doctor'): void {
    if (targetRole === 'doctor') {
      // Cambiar a sesión del primer doctor por defecto
      const doctor = this.doctorService.doctors[0] ?? DEFAULT_DOCTORS[0];
      const user: User = {
        name: doctor.name,
        email: doctor.email,
        avatar: doctor.name[0].toUpperCase(),
        role: 'doctor',
        specialty: doctor.specialty,
        doctorId: doctor.id,
      };
      this.setUser(user);
    } else {
      // Cambiar a sesión del cliente demo (Alexander)
      const user: User = {
        name: 'Alexander',
        email: 'alexander@pettime.com',
        avatar: 'A',
        role: 'client',
      };
      this.setUser(user);
    }
  }

  /**
   * Actualiza los datos del perfil del usuario autenticado.
   */
  updateUser(updates: Partial<User>): void {
    const current = this.currentUserSubject.value;
    if (!current) return;

    const updated: User = {
      ...current,
      ...updates,
      // Solo recalcular avatar si no viene explícitamente en updates Y hay un name nuevo
      avatar: updates.avatar ?? (updates.name ? updates.name[0].toUpperCase() : current.avatar),
    };

    this.setUser(updated);
  }

  /**
   * Cierra la sesión del usuario.
   * Limpia el estado en memoria y en localStorage.
   */
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(AUTH_KEY);
  }

  // ── Métodos privados ──────────────────────────────────────

  /** Actualiza el BehaviorSubject y persiste en localStorage */
  private setUser(user: User): void {
    this.currentUserSubject.next(user);
    this.saveUserToStorage(user);
  }

  /** Carga el usuario desde localStorage al arrancar la app */
  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }

  /** Guarda el usuario en localStorage */
  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch {
      console.warn('No se pudo guardar en localStorage');
    }
  }

  /** Utilidad: promesa con retraso para simular latencia */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
