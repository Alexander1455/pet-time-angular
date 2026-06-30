// ============================================================
// auth.service.ts
// Servicio de autenticación de PetTime.
// Gestiona el estado del usuario autenticado usando BehaviorSubject
// y persiste la sesión en localStorage.
//
// REEMPLAZA: AppContext (LOGIN, LOGOUT, SET_USER actions)
// ============================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LoginCredentials, RegisterData } from '../../models/user.model';

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

  // ── Getters síncronos ─────────────────────────────────────

  /** Retorna el usuario actual de forma síncrona */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** Retorna true si hay un usuario autenticado */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // ── Métodos de sesión ─────────────────────────────────────

  /**
   * Simula el inicio de sesión con email y contraseña.
   * En producción, aquí iría una llamada HTTP al backend.
   * @returns Promise<void> resuelve tras simular la latencia
   */
  async login(credentials: LoginCredentials): Promise<void> {
    // Simula latencia de servidor
    await this.delay(1000);

    const user: User = {
      name: 'Alexander',
      email: credentials.email,
      avatar: credentials.email[0].toUpperCase(),
    };

    this.setUser(user);
  }

  /**
   * Simula el registro de un nuevo usuario.
   * Crea el usuario con los datos de los 3 pasos del wizard.
   */
  async register(data: RegisterData): Promise<void> {
    await this.delay(1200);

    const user: User = {
      name: `${data.nombres} ${data.apellidos}`,
      email: data.email,
      avatar: data.nombres[0].toUpperCase(),
      nombres: data.nombres,
      apellidos: data.apellidos,
      dni: data.dni,
      telefono: data.telefono,
      genero: data.genero,
    };

    this.setUser(user);
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
      avatar: updates.name ? updates.name[0].toUpperCase() : current.avatar,
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
