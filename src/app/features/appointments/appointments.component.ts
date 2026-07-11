// ============================================================
// appointments.component.ts — Catálogo de servicios y booking
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PetService } from '../../core/services/pet.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { AuthService } from '../../core/services/auth.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DemoSwitcherComponent } from '../../shared/components/demo-switcher/demo-switcher.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Pet } from '../../models/pet.model';
import { Appointment, ServiceItem, ALL_SERVICES, SERVICE_FILTERS } from '../../models/appointment.model';
import { Doctor } from '../../models/doctor.model';

const VET_NAME    = 'PetTime Clínica Central';
const VET_ADDRESS = 'Av. Javier Prado Este 1234, San Isidro';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BottomNavComponent, SidebarComponent, DemoSwitcherComponent, ModalComponent],
  template: `
    <div class="page-layout">
      <app-sidebar></app-sidebar>

      <div class="page-content">
        <!-- Header -->
        <div class="p-4 bg-white border-bottom">
          <h1 class="fw-bold mb-1" style="color:#1a1a2e;font-size:22px;">Servicios 🏥</h1>
          <p class="text-muted small mb-0">Agenda el cuidado de tu mascota en <strong>PetTime Clínica Central</strong></p>
        </div>

        <div class="px-3 pt-3">
          <!-- Filtros de categoría -->
          <div class="d-flex gap-2 overflow-auto pb-2 mb-4" style="scrollbar-width:none;">
            <button
              *ngFor="let f of filters"
              class="btn btn-sm flex-shrink-0 fw-semibold"
              [class.btn-primary]="activeFilter === f"
              [class.btn-outline-secondary]="activeFilter !== f"
              style="border-radius:20px;font-size:12px;"
              (click)="activeFilter = f">
              {{ f }}
            </button>
          </div>

          <!-- Tarjetas de servicio (grid en escritorio) -->
          <div class="services-grid">
            <div *ngFor="let svc of filteredServices" class="card border-0 shadow-sm" style="border-radius:16px;">
              <div class="card-body p-3">
                <div class="d-flex align-items-start gap-3">
                  <div class="d-flex align-items-center justify-content-center flex-shrink-0"
                    style="width:56px;height:56px;border-radius:14px;background:rgba(50,172,220,0.1);font-size:26px;">
                    {{ svc.emoji }}
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                      <h6 class="fw-bold mb-1" style="color:#1a1a2e;font-size:14px;">{{ svc.name }}</h6>
                      <span class="badge bg-light text-primary fw-bold">{{ svc.price }}</span>
                    </div>
                    <p class="text-muted mb-2" style="font-size:12px;">{{ svc.desc }}</p>
                    <div class="d-flex align-items-center justify-content-between">
                      <span class="text-muted" style="font-size:11px;">
                        <i class="bi bi-clock me-1"></i>{{ svc.duration }}
                      </span>
                      <button class="btn btn-primary btn-sm fw-bold" style="border-radius:10px;font-size:12px;"
                        (click)="openBooking(svc)">
                        <i class="bi bi-calendar-plus me-1"></i>Agendar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de Booking -->
        <app-modal *ngIf="selectedService" [title]="selectedService.emoji + ' ' + selectedService.name" (closed)="closeBooking()">
          <p class="text-muted small mb-3">{{ selectedService.duration }} · {{ selectedService.price }}</p>

          <form [formGroup]="bookingForm" (ngSubmit)="onConfirm()">

            <!-- Selección de mascota -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">🐾 Mascota</label>
              <select class="form-select" formControlName="petId"
                [class.is-invalid]="bookingForm.get('petId')?.invalid && bookingForm.get('petId')?.touched">
                <option value="">Elige tu mascota...</option>
                <option *ngFor="let p of (pets$ | async)" [value]="p.getId()">
                  {{ p.getEmoji() }} {{ p.getName() }} — {{ p.getTypeLabel() }}
                </option>
              </select>
              <div class="invalid-feedback">Selecciona una mascota</div>
            </div>

            <!-- Selección de Doctor -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">
                <i class="bi bi-person-badge me-1"></i>Veterinario asignado
              </label>
              <div *ngIf="availableDoctors.length === 0" class="alert alert-warning py-2 small">
                <i class="bi bi-exclamation-triangle me-1"></i>
                No hay veterinarios disponibles para este servicio.
              </div>
              <div class="d-flex flex-column gap-2">
                <button *ngFor="let doc of availableDoctors" type="button"
                  class="btn text-start p-3 d-flex justify-content-between align-items-center"
                  [class.btn-primary]="bookingForm.get('doctorId')?.value === doc.id"
                  [class.btn-outline-secondary]="bookingForm.get('doctorId')?.value !== doc.id"
                  style="border-radius:12px;font-size:13px;"
                  (click)="selectDoctor(doc)">
                  <div>
                    <div class="fw-semibold">🩺 {{ doc.name }}</div>
                    <div class="opacity-75 small">Esp: {{ doc.specialty }}</div>
                  </div>
                  <span class="badge"
                    [style.background]="bookingForm.get('doctorId')?.value === doc.id ? 'rgba(255,255,255,0.25)' : 'rgba(50,172,220,0.12)'"
                    style="color: inherit; font-size:10px;">
                    {{ doc.availabilities.length }} horarios
                  </span>
                </button>
              </div>
              <div *ngIf="bookingForm.get('doctorId')?.invalid && bookingForm.get('doctorId')?.touched"
                class="text-danger small mt-1">Selecciona un veterinario</div>
            </div>

            <!-- Fecha -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">
                <i class="bi bi-calendar3 me-1"></i>Fecha de la cita
              </label>
              <input type="date" class="form-control" formControlName="date" [min]="today"
                [class.is-invalid]="bookingForm.get('date')?.invalid && bookingForm.get('date')?.touched"
                (change)="onDateChange()">
              <div class="invalid-feedback">Selecciona una fecha</div>
            </div>

            <!-- Horario dinámico -->
            <div class="mb-4" *ngIf="bookingForm.get('doctorId')?.value">
              <label class="form-label fw-semibold small">
                <i class="bi bi-clock me-1"></i>Horario disponible
              </label>
              <div *ngIf="bookingForm.get('date')?.value; else noDateYet" class="d-flex flex-wrap gap-2">
                <ng-container *ngIf="availableSlots.length > 0; else noSlots">
                  <button *ngFor="let t of availableSlots" type="button"
                    class="btn btn-sm fw-semibold"
                    [class.btn-primary]="bookingForm.get('time')?.value === t"
                    [class.btn-outline-secondary]="bookingForm.get('time')?.value !== t"
                    style="border-radius:10px;font-size:12px;"
                    (click)="bookingForm.get('time')?.setValue(t)">
                    {{ t }}
                  </button>
                </ng-container>
                <ng-template #noSlots>
                  <div class="alert alert-info py-2 small w-100">
                    <i class="bi bi-info-circle me-1"></i>
                    No hay horarios disponibles para esta fecha con este veterinario.
                  </div>
                </ng-template>
              </div>
              <ng-template #noDateYet>
                <p class="text-muted small"><i class="bi bi-arrow-up me-1"></i>Selecciona una fecha primero</p>
              </ng-template>
              <div *ngIf="bookingForm.get('time')?.invalid && bookingForm.get('time')?.touched"
                class="text-danger small mt-1">Selecciona un horario</div>
            </div>

            <button type="submit" class="btn w-100 fw-bold py-3"
              style="background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;border-radius:12px;border:none;"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Procesando...' : '✅ Confirmar cita' }}
            </button>
          </form>
        </app-modal>

        <app-bottom-nav></app-bottom-nav>
        <app-demo-switcher></app-demo-switcher>
      </div>
    </div>
  `,
  styles: [`
    .page-layout {
      display: flex;
      min-height: 100vh;
    }
    .page-content {
      flex: 1;
      background: #f8f9fa;
      padding-bottom: 80px;
    }
    @media (min-width: 768px) {
      .page-content {
        margin-left: 240px;
        padding-bottom: 0;
      }
    }
    .services-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    @media (min-width: 768px) {
      .services-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1200px) {
      .services-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `],
})
export class AppointmentsComponent implements OnInit {
  pets$: Observable<Pet[]>;
  activeFilter = 'Todos';
  selectedService: ServiceItem | null = null;
  bookingForm!: FormGroup;
  loading = false;
  today = new Date().toISOString().split('T')[0];
  availableDoctors: Doctor[] = [];
  availableSlots: string[] = [];

  readonly filters = SERVICE_FILTERS;
  readonly allServices = ALL_SERVICES;

  get filteredServices(): ServiceItem[] {
    return this.activeFilter === 'Todos'
      ? this.allServices
      : this.allServices.filter(s => s.category === this.activeFilter);
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly petService: PetService,
    private readonly appointmentService: AppointmentService,
    private readonly doctorService: DoctorService,
    private readonly authService: AuthService,
  ) {
    this.pets$ = this.petService.pets$;
  }

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      petId:    ['', Validators.required],
      doctorId: ['', Validators.required],
      date:     ['', Validators.required],
      time:     ['', Validators.required],
    });

    this.route.queryParams.subscribe(params => {
      if (params['categoria'] && this.filters.includes(params['categoria'])) {
        this.activeFilter = params['categoria'];
      }
    });
  }

  openBooking(svc: ServiceItem): void {
    this.selectedService = svc;
    this.bookingForm.reset();
    this.availableSlots = [];
    // Cargar doctores según la categoría del servicio
    this.availableDoctors = this.doctorService.getDoctorsBySpecialty(svc.category as any);
  }

  selectDoctor(doc: Doctor): void {
    this.bookingForm.get('doctorId')?.setValue(doc.id);
    this.bookingForm.get('time')?.setValue('');
    this.updateAvailableSlots();
  }

  onDateChange(): void {
    this.bookingForm.get('time')?.setValue('');
    this.updateAvailableSlots();
  }

  private updateAvailableSlots(): void {
    const doctorId = this.bookingForm.get('doctorId')?.value;
    const date = this.bookingForm.get('date')?.value;
    if (!doctorId || !date) { this.availableSlots = []; return; }

    const bookedTimes = this.appointmentService.getBookedTimesForDoctor(doctorId, date);
    this.availableSlots = this.doctorService.getAvailableSlots(doctorId, date, bookedTimes);
  }

  closeBooking(): void {
    this.selectedService = null;
    this.bookingForm.reset();
    this.loading = false;
    this.availableDoctors = [];
    this.availableSlots = [];
  }

  async onConfirm(): Promise<void> {
    if (this.bookingForm.invalid) { this.bookingForm.markAllAsTouched(); return; }
    this.loading = true;

    await new Promise(r => setTimeout(r, 900));

    const { petId, doctorId, date, time } = this.bookingForm.value;
    const pets   = this.petService.pets;
    const pet    = pets.find(p => String(p.getId()) === petId);
    const doctor = this.doctorService.findById(doctorId);
    const user   = this.authService.currentUser;

    const appointment: Appointment = {
      id:         Date.now(),
      service:    this.selectedService!.name,
      pet:        pet?.getName() ?? 'Mi mascota',
      petId:      pet ? pet.getId() : undefined,
      ownerName:  user?.name ?? 'Alexander',
      ownerEmail: user?.email ?? 'alexander@pettime.com',
      date,
      time,
      status:     'pending',
      icon:       this.selectedService!.emoji,
      vet:        VET_NAME,
      address:    VET_ADDRESS,
      doctorId:   doctorId,
      doctorName: doctor?.name ?? 'Veterinario',
    };

    this.appointmentService.addAppointment(appointment);
    this.closeBooking();
  }
}
