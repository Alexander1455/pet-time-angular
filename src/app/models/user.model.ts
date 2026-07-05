// ============================================================
// user.model.ts
// Modelos TypeScript para el usuario de PetTime.
// Define la interfaz User con todos los datos del dueño.
// ============================================================

/**
 * Interface User
 * Representa al usuario autenticado en la aplicación PetTime.
 * Incluye tanto los datos de sesión como los datos personales del dueño.
 */
export interface User {
  /** Nombre completo mostrado en la app */
  name: string;
  /** Correo electrónico (identificador único) */
  email: string;
  /** Inicial del nombre para el avatar visual */
  avatar: string;
  /** Rol del usuario: 'client' (dueño de mascota) o 'doctor' (veterinario) */
  role?: 'client' | 'doctor';
  /** Especialidad médica (solo para doctores) */
  specialty?: string;
  /** ID del perfil de doctor asociado (solo para doctores) */
  doctorId?: string;
  /** Nombres de pila del dueño (capturados en el Paso 2 del registro) */
  nombres?: string;
  /** Apellidos del dueño */
  apellidos?: string;
  /** Documento Nacional de Identidad (8 dígitos) */
  dni?: string;
  /** Número de teléfono (9 dígitos) */
  telefono?: string;
  /** Género del dueño: 'Masculino' | 'Femenino' */
  genero?: string;
}

/**
 * Interface LoginCredentials
 * Datos necesarios para iniciar sesión.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface RegisterData
 * Datos completos del formulario de registro (3 pasos combinados).
 */
export interface RegisterData {
  // Paso 1: Sesión
  email: string;
  password: string;
  // Paso 2: Datos del dueño
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  genero: string;
  // Paso 3: Primera mascota
  petName: string;
  petType: string;
  petOtherDetails?: string; // Detalle de tipo de mascota cuando petType === 'otro'
  sexo: string;
  raza: string;
  fechaNac: string;
}

/** Datos de registro para un doctor / veterinario */
export interface DoctorRegisterData {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  specialty: string;
  availabilities: string[];
}
