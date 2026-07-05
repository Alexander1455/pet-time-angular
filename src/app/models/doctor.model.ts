// ============================================================
// doctor.model.ts
// Modelo para los doctores / veterinarios de PetTime.
// ============================================================

/**
 * Interface Doctor
 * Representa a un veterinario registrado en PetTime.
 * Los doctores tienen especialidades y horarios de disponibilidad propios.
 */
export interface Doctor {
  /** Identificador único del doctor */
  id: string;
  /** Nombre completo del doctor */
  name: string;
  /** Correo electrónico (utilizado para el login) */
  email: string;
  /** Contraseña simulada (demo — en producción iría en backend) */
  password: string;
  /** Especialidad médica del doctor */
  specialty: DoctorSpecialty;
  /** Horarios de disponibilidad habitual (ej: ['08:00 AM', '09:00 AM']) */
  availabilities: string[];
}

/** Especialidades disponibles en PetTime */
export type DoctorSpecialty = 'Vacunas' | 'Baño' | 'Corte' | 'Consulta' | 'Dental' | 'Todos';

/** Doctores pre-cargados por defecto para demostración */
export const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Carlos Rojas',
    email: 'carlos.rojas@pettime.com',
    password: '123456',
    specialty: 'Consulta',
    availabilities: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'],
  },
  {
    id: 'doc-2',
    name: 'Dra. Laura Méndez',
    email: 'laura.mendez@pettime.com',
    password: '123456',
    specialty: 'Vacunas',
    availabilities: ['08:00 AM', '09:00 AM', '10:00 AM', '02:00 PM'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Andrés Vega',
    email: 'andres.vega@pettime.com',
    password: '123456',
    specialty: 'Dental',
    availabilities: ['10:00 AM', '11:00 AM', '12:00 PM', '04:00 PM', '05:00 PM'],
  },
  {
    id: 'doc-4',
    name: 'Dra. Sofía Paredes',
    email: 'sofia.paredes@pettime.com',
    password: '123456',
    specialty: 'Baño',
    availabilities: ['08:00 AM', '09:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
  },
  {
    id: 'doc-5',
    name: 'Dr. Miguel Torres',
    email: 'miguel.torres@pettime.com',
    password: '123456',
    specialty: 'Corte',
    availabilities: ['09:00 AM', '10:00 AM', '12:00 PM', '03:00 PM'],
  },
];
