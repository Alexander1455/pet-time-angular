// ============================================================
// appointment.model.ts
// Modelos TypeScript para las citas veterinarias de PetTime.
// ============================================================

/**
 * AppointmentStatus
 * Tipo union que representa todos los estados posibles de una cita.
 * Usado por el Pipe AppointmentStatusPipe para la transformación visual.
 */
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/**
 * Interface Appointment
 * Representa una cita veterinaria en PetTime.
 * Se usa tanto para citas activas (appointments) como para el historial (history).
 */
export interface Appointment {
  /** Identificador único basado en timestamp */
  id: number;
  /** Nombre del servicio (ej. "Vacuna Antirrábica") */
  service: string;
  /** Nombre de la mascota que asistirá */
  pet: string;
  /** Fecha de la cita en formato ISO (YYYY-MM-DD) */
  date: string;
  /** Horario de la cita (ej. "10:00 AM") */
  time: string;
  /** Estado actual de la cita */
  status: AppointmentStatus;
  /** Emoji representativo del servicio */
  icon: string;
  /** Nombre de la sede / veterinaria */
  vet: string;
  /** Dirección de la sede */
  address: string;
  /** ID del doctor asignado a la cita */
  doctorId?: string;
  /** Nombre legible del doctor asignado */
  doctorName?: string;
  /** ID de la mascota asociada */
  petId?: number;
  /** Nombre del dueño de la mascota */
  ownerName?: string;
  /** Correo del dueño de la mascota */
  ownerEmail?: string;
  /** Ficha clínica completada por el doctor tras la atención */
  medicalRecord?: MedicalRecord;
}

/**
 * Interface MedicalRecord
 * Ficha clínica registrada por el veterinario al completar la atención.
 */
export interface MedicalRecord {
  /** Tratamiento o procedimiento realizado (ej: Vacuna Antirrábica aplicada) */
  treatment: string;
  /** Medicamentos o insumos utilizados */
  medications: string;
  /** Reacciones observadas durante o después de la atención */
  reactions: string;
  /** Recomendaciones para el dueño de la mascota */
  recommendations: string;
  /** Fecha y hora de atención registrada */
  attendedAt: string;
}

/**
 * Interface BookingFormData
 * Datos del formulario de reserva de cita (BookingModal).
 */
export interface BookingFormData {
  petId: string;
  sedeId: string;
  date: string;
  time: string;
}

/**
 * Datos de servicios disponibles para mostrar en el catálogo.
 */
export interface ServiceItem {
  id: number;
  name: string;
  emoji: string;
  desc: string;
  price: string;
  category: string;
  duration: string;
}

/** Catálogo de servicios disponibles en PetTime */
export const ALL_SERVICES: ServiceItem[] = [
  { id: 1, name: 'Vacuna Antirrábica', emoji: '💉', desc: 'Protege a tu mascota contra la rabia. Incluye revisión previa y certificado oficial.', price: 'S/ 45', category: 'Vacunas',  duration: '30 min' },
  { id: 2, name: 'Baño y Secado',      emoji: '🛁', desc: 'Baño completo con champú premium, secado y perfumado especial para tu mascota.',    price: 'S/ 35', category: 'Baño',      duration: '1 hora' },
  { id: 3, name: 'Corte de Pelo',      emoji: '✂️', desc: 'Estilismo profesional y corte personalizado según raza y preferencias del dueño.',   price: 'S/ 30', category: 'Corte',     duration: '45 min' },
  { id: 4, name: 'Consulta General',   emoji: '🩺', desc: 'Revisión médica completa con veterinario certificado. Incluye diagnóstico.',          price: 'S/ 60', category: 'Consulta',  duration: '1 hora' },
  { id: 5, name: 'Limpieza Dental',    emoji: '🦷', desc: 'Higiene dental profesional con ultrasonido. Previene enfermedades bucales.',           price: 'S/ 80', category: 'Dental',    duration: '1 hora' },
  { id: 6, name: 'Desparasitación',    emoji: '💊', desc: 'Eliminación de parásitos internos y externos con productos certificados.',            price: 'S/ 25', category: 'Consulta',  duration: '20 min' },
];

/** Filtros de categorías disponibles */
export const SERVICE_FILTERS = ['Todos', 'Vacunas', 'Baño', 'Corte', 'Consulta', 'Dental'];

/** Horarios disponibles para agendar */
export const TIME_SLOTS = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '02:00 PM','03:00 PM','04:00 PM','05:00 PM'
];
