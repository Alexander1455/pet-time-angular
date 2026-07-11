# 🐾 PetTime Angular

![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)

> Aplicación web de gestión veterinaria construida con **Angular 19 Standalone** y arquitectura modular profesional. Permite a los dueños de mascotas registrarse, gestionar sus mascotas, agendar citas veterinarias y consultar su historial de atenciones.

---

## 📋 Tabla de contenidos

- [Demo y Pantallas](#-demo-y-pantallas)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Evidencias POO](#-evidencias-poo)
- [Instalación](#-instalación)
- [Scripts disponibles](#-scripts-disponibles)
- [Características](#-características)

---

## 🎬 Demo y Pantallas

### Vista Escritorio (Panel Cliente)
![Dashboard cliente en escritorio](file:///C:/Users/Upgrade/.gemini/antigravity-ide/brain/2543e41a-d286-417c-ba7d-0577e2cc0e3d/dashboard_desktop_1783196496626.png)

### Vista Escritorio (Panel Veterinario)
![Dashboard veterinario en escritorio](file:///C:/Users/Upgrade/.gemini/antigravity-ide/brain/2543e41a-d286-417c-ba7d-0577e2cc0e3d/doctor_dashboard_1783196556371.png)

### Vista Móvil (Panel Cliente)
![Dashboard cliente en móvil](file:///C:/Users/Upgrade/.gemini/antigravity-ide/brain/2543e41a-d286-417c-ba7d-0577e2cc0e3d/dashboard_mobile_1783196504408.png)

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Angular | 19 | Framework principal (Standalone) |
| TypeScript | 5.x | Lenguaje tipado con POO avanzada |
| Bootstrap | 5 | Estilos responsivos y componentes UI |
| Bootstrap Icons | 1.x | Iconografía |
| RxJS | 7 | Programación reactiva (BehaviorSubject, Observable) |
| Angular Router | 19 | Navegación con Lazy Loading |
| Reactive Forms | 19 | Manejo avanzado de formularios |

---

## 🏗 Arquitectura

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts              # Guard funcional de autenticación
│   └── services/
│       ├── auth.service.ts            # Gestión de sesión con BehaviorSubject y cambio de rol
│       ├── pet.service.ts             # CRUD mascotas + PetFactory
│       ├── appointment.service.ts     # CRUD citas + historial + ficha clínica reactiva
│       └── doctor.service.ts          # Gestión de doctores, especialidades y horarios
│
├── models/
│   ├── user.model.ts                  # Interface User, LoginCredentials, RegisterData, DoctorRegisterData
│   ├── pet.model.ts                   # Abstract Pet + Dog + Cat + OtherPet + PetFactory
│   ├── appointment.model.ts           # Interface Appointment + catálogo + MedicalRecord
│   └── doctor.model.ts                # Interface Doctor + DEFAULT_DOCTORS[]
│
├── shared/
│   ├── components/
│   │   ├── input-field/               # InputFieldComponent (@Input/@Output)
│   │   ├── service-card/              # ServiceCardComponent (@Input/@Output)
│   │   ├── bottom-nav/                # BottomNavComponent (visible en móvil)
│   │   ├── sidebar/                   # SidebarComponent (visible en escritorio)
│   │   ├── demo-switcher/             # DemoSwitcherComponent (flotante para demostración)
│   │   └── modal/                     # ModalComponent (ng-content)
│   ├── directives/
│   │   └── highlight-appointment.directive.ts  ← DIRECTIVA PERSONALIZADA
│   └── pipes/
│       └── appointment-status.pipe.ts          ← PIPE PERSONALIZADO
│
├── features/
│   ├── auth/
│   │   ├── login/                    # LoginComponent (Reactive Form con detección de rol)
│   │   └── register/                 # RegisterComponent (Wizard Dueño / Formulario Doctor)
│   │       ├── step-one/             # Email + contraseña
│   │       ├── step-two/             # Datos del dueño
│   │       └── step-three/           # Datos de la mascota (con condicional "Otro")
│   ├── dashboard/                    # DashboardComponent (Vista dual Cliente / Doctor)
│   ├── appointments/                 # AppointmentsComponent (Servicios + Booking por doctor y horario)
│   ├── history/                      # HistoryComponent (Historial con Fichas Clínicas)
│   └── profile/                      # ProfileComponent (Perfil)
│
├── app.component.ts                  # Root component
├── app.config.ts                     # Configuración Angular (providers)
└── app.routes.ts                     # Rutas con Lazy Loading + AuthGuard
```

---

## 🎓 Evidencias POO

### Interfaces TypeScript

| Interface | Archivo | Descripción |
|-----------|---------|-------------|
| `User` | `user.model.ts` | Datos del usuario autenticado (con soporte de roles) |
| `LoginCredentials` | `user.model.ts` | Datos de inicio de sesión |
| `RegisterData` | `user.model.ts` | Datos del formulario de registro de cliente |
| `DoctorRegisterData` | `user.model.ts` | Datos del formulario de registro de doctor |
| `Appointment` | `appointment.model.ts` | Cita veterinaria |
| `BookingFormData` | `appointment.model.ts` | Formulario de reserva |
| `MedicalRecord` | `appointment.model.ts` | Ficha clínica completada por el doctor |
| `ServiceItem` | `appointment.model.ts` | Servicio del catálogo |
| `Doctor` | `doctor.model.ts` | Perfil del veterinario, especialidad y horarios |
| `PetData` | `pet.model.ts` | Serialización plana de mascota |

### Abstracción

```typescript
// pet.model.ts
export abstract class Pet {
  abstract getEmoji(): string;       // Método abstracto
  abstract getDescription(): string; // Método abstracto
  getAge(): string { /* ... */ }     // Método concreto reutilizable
}
```

### Herencia

```typescript
export class Dog extends Pet { /* ... */ }
export class Cat extends Pet { /* ... */ }
export class OtherPet extends Pet { /* ... */ }
```

### Polimorfismo

```typescript
// Cada subclase sobrescribe los métodos abstractos:
class Dog extends Pet {
  getEmoji(): string { return '🐶'; }
  getDescription(): string { return `${this.name} es un perro de raza ${this.raza}.`; }
}
class Cat extends Pet {
  getEmoji(): string { return '🐱'; }
  getDescription(): string { return `${this.name} es un gato de raza ${this.raza}.`; }
}
```

### Encapsulamiento

```typescript
export abstract class Pet {
  private id: number;       // Solo accesible vía getId()
  protected name: string;   // Accesible en subclases
  protected raza: string;
  
  getId(): number { return this.id; }    // Getter público
  getName(): string { return this.name; }
}
```

### Patrón Factory (Factory Method)

```typescript
export class PetFactory {
  static create(data: PetData): Pet {
    switch (data.type) {
      case 'perro': return new Dog(data);
      case 'gato':  return new Cat(data);
      default:      return new OtherPet(data);
    }
  }
}
```

### Pipe Personalizado

```typescript
// shared/pipes/appointment-status.pipe.ts
@Pipe({ name: 'appointmentStatus', standalone: true })
export class AppointmentStatusPipe implements PipeTransform {
  transform(value: AppointmentStatus): string {
    // 'pending' → 'Pendiente', 'confirmed' → 'Confirmada', etc.
  }
}
```

### Directiva Personalizada

```typescript
// shared/directives/highlight-appointment.directive.ts
@Directive({ selector: '[appHighlightAppointment]', standalone: true })
export class HighlightAppointmentDirective implements OnInit {
  @Input() appHighlightAppointment!: string; // fecha ISO
  // Resalta citas de hoy (naranja) y próximas ≤3 días (azul)
}
```

### Componentes con @Input / @Output

```typescript
// ServiceCardComponent
@Input({ required: true }) appointment!: Appointment;
@Input() actionLabel = '';
@Output() action = new EventEmitter<number>();

// InputFieldComponent
@Input() label = '';
@Input() type = 'text';
@Input() control: AbstractControl | null = null;
```

---

## ⚙️ Instalación

### Requisitos previos
- Node.js >= 18.x
- npm >= 9.x

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd pet-time-angular

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en **http://localhost:4200**.

---

## 📦 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run lint` | Ejecuta el linter (ESLint) |

---

## ✨ Características

- 🔐 **Autenticación** — Login y registro con persistencia en `localStorage` (auto-detecta doctores)
- 👥 **Múltiples Roles (B2B/B2C)** — Portal dual para Clientes (dueños) y Doctores (veterinarios)
- 🔍 **Consulta de Historial por Mascota y Dueño** — Buscador inteligente para doctores que permite buscar por dueño o mascota, ver las mascotas asociadas, seleccionar una y ver todo el historial de atenciones clínicas de ese doctor con acceso a la ficha/formulario de atención
- 📝 **Fichas Clínicas** — Doctores pueden registrar el tratamiento, medicamentos y recomendaciones médicas
- 🎭 **Demo Switcher Widget** — Cambia de rol en la presentación con un solo clic en el botón flotante
- 📐 **Responsividad Premium** — Sidebar oscuro para pantallas grandes (desktop) y Bottom Nav para móviles
- 🩺 **Booking Dinámico** — Selección de doctor por especialidad y horarios libres en tiempo real
- 🐇 **Mascotas Especiales** — Entrada condicional interactiva al elegir "Otro" tipo de mascota
- 🧩 **Arquitectura Modular** — Features separados con Lazy Loading y standalone components
- 🛡️ **Rutas Protegidas** — `AuthGuard` funcional de Angular 19
- 🐾 **Gestión de Mascotas** — POO con herencia: `Dog`, `Cat`, `OtherPet`
- 📅 **Gestión de Citas** — Agendar, confirmar, completar y cancelar
- 📊 **Estado Reactivo** — `BehaviorSubject` + `Observable` (RxJS)
- 🔧 **Pipe Personalizado** — `AppointmentStatusPipe` (status → español)
- 💡 **Directiva Personalizada** — `HighlightAppointmentDirective` (resaltado de fechas)

---

## 👨‍💻 Autor

Proyecto académico — Angular 19
