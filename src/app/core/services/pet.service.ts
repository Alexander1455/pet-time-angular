// ============================================================
// pet.service.ts
// Servicio para gestión de mascotas en PetTime.
// Usa BehaviorSubject para estado reactivo y PetFactory para
// instanciar la clase correcta (Dog, Cat, OtherPet).
//
// REEMPLAZA: AppContext (ADD_PET action + state.pets)
// ============================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pet, PetData, PetFactory } from '../../models/pet.model';

const PETS_KEY = 'pettime_pets_state';

/** Mascotas de ejemplo pre-cargadas para demostración */
const DEFAULT_PETS: PetData[] = [
  { id: 1, name: 'Max',  type: 'perro', emoji: '🐶', raza: 'Labrador', sexo: 'Macho',  fechaNac: '2022-05-10' },
  { id: 2, name: 'Luna', type: 'gato',  emoji: '🐱', raza: 'Persa',    sexo: 'Hembra', fechaNac: '2021-08-22' },
];

@Injectable({ providedIn: 'root' })
export class PetService {

  // ── Estado privado (ENCAPSULAMIENTO) ──────────────────────
  private readonly petsSubject = new BehaviorSubject<Pet[]>(this.loadPets());

  // ── Observables públicos ──────────────────────────────────

  /** Stream reactivo de la lista de mascotas */
  readonly pets$: Observable<Pet[]> = this.petsSubject.asObservable();

  // ── Getters síncronos ─────────────────────────────────────

  /** Retorna la lista actual de mascotas de forma síncrona */
  get pets(): Pet[] {
    return this.petsSubject.value;
  }

  // ── Métodos CRUD ──────────────────────────────────────────

  /**
   * Agrega una nueva mascota a la lista.
   * Usa PetFactory para crear la instancia correcta (Dog/Cat/OtherPet).
   */
  addPet(data: Omit<PetData, 'id' | 'emoji'>): void {
    const petData: PetData = {
      ...data,
      id: Date.now(),
      emoji: '', // PetFactory lo asignará vía getEmoji()
    };

    const newPet = PetFactory.create(petData);
    const updated = [...this.petsSubject.value, newPet];
    this.updateState(updated);
  }

  /**
   * Elimina una mascota por su ID.
   */
  removePet(id: number): void {
    const updated = this.petsSubject.value.filter(p => p.getId() !== id);
    this.updateState(updated);
  }

  /**
   * Retorna una mascota por su ID, o undefined si no existe.
   */
  findById(id: number): Pet | undefined {
    return this.petsSubject.value.find(p => p.getId() === id);
  }

  // ── Métodos privados ──────────────────────────────────────

  /** Actualiza el BehaviorSubject y persiste en localStorage */
  private updateState(pets: Pet[]): void {
    this.petsSubject.next(pets);
    this.savePets(pets);
  }

  /** Carga mascotas desde localStorage, o usa las de ejemplo */
  private loadPets(): Pet[] {
    try {
      const raw = localStorage.getItem(PETS_KEY);
      const data: PetData[] = raw ? JSON.parse(raw) : DEFAULT_PETS;
      return data.map(d => PetFactory.create(d));
    } catch {
      return DEFAULT_PETS.map(d => PetFactory.create(d));
    }
  }

  /** Serializa las mascotas y las guarda en localStorage */
  private savePets(pets: Pet[]): void {
    try {
      const data = pets.map(p => p.toJSON());
      localStorage.setItem(PETS_KEY, JSON.stringify(data));
    } catch {
      console.warn('No se pudo guardar mascotas en localStorage');
    }
  }
}
