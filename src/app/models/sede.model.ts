// ============================================================
// sede.model.ts
// Modelo para las sucursales de PetTime disponibles para agendar.
// ============================================================

/**
 * Interface Sede
 * Representa una sucursal / sede de Pettime donde se pueden agendar citas.
 */
export interface Sede {
  /** Identificador único de la sede */
  id: number;
  /** Nombre comercial de la sede */
  name: string;
  /** Dirección completa */
  address: string;
  /** Distancia aproximada al usuario */
  dist: string;
}

/** Sedes disponibles en PetTime */
export const SEDES: Sede[] = [
  { id: 1, name: 'Pettime Miraflores', address: 'Av. Larco 450, Miraflores',              dist: '1.2 km' },
  { id: 2, name: 'Pettime San Isidro', address: 'Calle Los Laureles 365, San Isidro',     dist: '2.5 km' },
  { id: 3, name: 'Pettime Surco',      address: 'Av. Primavera 890, Santiago de Surco',   dist: '3.8 km' },
  { id: 4, name: 'Pettime La Molina',  address: 'Av. La Molina 1256, La Molina',          dist: '5.1 km' },
];
