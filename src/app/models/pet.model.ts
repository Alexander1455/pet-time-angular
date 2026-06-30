// ============================================================
// pet.model.ts
// Modelos TypeScript para las mascotas de PetTime.
//
// CONCEPTOS POO IMPLEMENTADOS:
// - Abstracción:    clase abstracta Pet con métodos abstractos
// - Herencia:       Dog, Cat, OtherPet extienden Pet
// - Polimorfismo:   getEmoji() y getDescription() sobrescritos
// - Encapsulamiento: propiedades private/protected con getters
// ============================================================

export type PetType = 'perro' | 'gato' | 'otro';
export type PetGender = 'Macho' | 'Hembra';

/**
 * Interface PetData
 * Representación plana de una mascota para serialización (localStorage, JSON).
 */
export interface PetData {
  id: number;
  name: string;
  type: PetType;
  emoji: string;
  raza: string;
  sexo: PetGender;
  fechaNac: string;
}

/**
 * Abstract class Pet — ABSTRACCIÓN
 * Define el contrato que todas las mascotas deben cumplir.
 * No se puede instanciar directamente; sólo mediante sus subclases.
 */
export abstract class Pet {
  /** ID único de la mascota — ENCAPSULAMIENTO (private) */
  private id: number;
  /** Nombre de la mascota — ENCAPSULAMIENTO (protected) */
  protected name: string;
  /** Tipo de mascota — ENCAPSULAMIENTO (protected) */
  protected type: PetType;
  /** Raza de la mascota — ENCAPSULAMIENTO (protected) */
  protected raza: string;
  /** Sexo de la mascota — ENCAPSULAMIENTO (protected) */
  protected sexo: PetGender;
  /** Fecha de nacimiento en formato ISO (YYYY-MM-DD) — ENCAPSULAMIENTO (protected) */
  protected fechaNac: string;

  constructor(data: PetData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.raza = data.raza;
    this.sexo = data.sexo;
    this.fechaNac = data.fechaNac;
  }

  // ── Métodos abstractos (POLIMORFISMO) ──────────────────────
  /** Devuelve el emoji representativo de la mascota */
  abstract getEmoji(): string;
  /** Devuelve una descripción legible de la mascota */
  abstract getDescription(): string;

  // ── Getters públicos (ENCAPSULAMIENTO) ─────────────────────
  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getType(): PetType { return this.type; }
  getRaza(): string { return this.raza; }
  getSexo(): PetGender { return this.sexo; }
  getFechaNac(): string { return this.fechaNac; }

  /**
   * Calcula la edad de la mascota en años o meses.
   * @returns string — p.ej. "2 años" o "4 meses"
   */
  getAge(): string {
    if (!this.fechaNac) return '—';
    const diff = Date.now() - new Date(this.fechaNac).getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.4)
    );
    return years > 0
      ? `${years} año${years !== 1 ? 's' : ''}`
      : `${months} mes${months !== 1 ? 'es' : ''}`;
  }

  /**
   * Serializa la mascota a PetData para guardar en localStorage.
   */
  toJSON(): PetData {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      emoji: this.getEmoji(),
      raza: this.raza,
      sexo: this.sexo,
      fechaNac: this.fechaNac,
    };
  }
}

// ── Subclases (HERENCIA + POLIMORFISMO) ──────────────────────

/**
 * Dog — representa un perro.
 * HERENCIA: extiende Pet.
 * POLIMORFISMO: sobreescribe getEmoji() y getDescription().
 */
export class Dog extends Pet {
  constructor(data: PetData) {
    super(data);
  }

  /** @override */
  getEmoji(): string {
    return '🐶';
  }

  /** @override */
  getDescription(): string {
    return `${this.name} es un perro de raza ${this.raza}.`;
  }
}

/**
 * Cat — representa un gato.
 * HERENCIA: extiende Pet.
 * POLIMORFISMO: sobreescribe getEmoji() y getDescription().
 */
export class Cat extends Pet {
  constructor(data: PetData) {
    super(data);
  }

  /** @override */
  getEmoji(): string {
    return '🐱';
  }

  /** @override */
  getDescription(): string {
    return `${this.name} es un gato de raza ${this.raza}.`;
  }
}

/**
 * OtherPet — representa mascotas de otro tipo (conejo, ave, etc.).
 * HERENCIA: extiende Pet.
 * POLIMORFISMO: sobreescribe getEmoji() y getDescription().
 */
export class OtherPet extends Pet {
  constructor(data: PetData) {
    super(data);
  }

  /** @override */
  getEmoji(): string {
    return '🐰';
  }

  /** @override */
  getDescription(): string {
    return `${this.name} es una mascota de tipo ${this.type}.`;
  }
}

// ── Fábrica (Factory Pattern) ────────────────────────────────

/**
 * PetFactory
 * Clase utilitaria que crea la instancia correcta de Pet
 * según el tipo recibido (perro → Dog, gato → Cat, otro → OtherPet).
 * Aplica el patrón Factory Method para desacoplar la creación de objetos.
 */
export class PetFactory {
  /**
   * Crea la instancia correcta de Pet según data.type.
   * @param data — PetData plano (ej. desde localStorage)
   * @returns Dog | Cat | OtherPet
   */
  static create(data: PetData): Pet {
    switch (data.type) {
      case 'perro': return new Dog(data);
      case 'gato':  return new Cat(data);
      default:      return new OtherPet(data);
    }
  }
}
