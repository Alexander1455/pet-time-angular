// ============================================================
// appointments.component.ts — Catálogo de servicios y booking
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PetService } from '../../core/services/pet.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { Pet } from '../../models/pet.model';
import { Appointment, ServiceItem, ALL_SERVICES, SERVICE_FILTERS, TIME_SLOTS } from '../../models/appointment.model';
import { SEDES, Sede } from '../../models/sede.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BottomNavComponent, ModalComponent],
  template: `
    <div class="app-shell" style="max-width:430px;margin:0 auto;min-height:100vh;background:#f8f9fa;padding-bottom:80px;">

      <!-- Header -->
      <div class="p-4 bg-white border-bottom">
        <h1 class="fw-bold mb-1" style="color:#1a1a2e;font-size:22px;">Servicios 🏥</h1>
        <p class="text-muted small mb-0">Agenda el cuidado de tu mascota</p>
      </div>

      <div class="px-3 pt-3">
        <!-- Filtros de categoría (pills Bootstrap) -->
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

        <!-- Tarjetas de servicio -->
        <div *ngFor="let svc of filteredServices" class="card border-0 shadow-sm mb-3" style="border-radius:16px;">
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
                {{ p.getEmoji() }} {{ p.getName() }} — {{ p.getRaza() }}
              </option>
            </select>
            <div class="invalid-feedback">Selecciona una mascota</div>
          </div>

          <!-- Selección de sede -->
          <div class="mb-3">
            <label class="form-label fw-semibold small">
              <i class="bi bi-geo-alt me-1"></i>Sede más cercana
            </label>
            <div class="d-flex flex-column gap-2">
              <button *ngFor="let sede of sedes" type="button"
                class="btn text-start p-3 d-flex justify-content-between align-items-center"
                [class.btn-primary]="bookingForm.get('sedeId')?.value === String(sede.id)"
                [class.btn-outline-secondary]="bookingForm.get('sedeId')?.value !== String(sede.id)"
                style="border-radius:12px;font-size:13px;"
                (click)="bookingForm.get('sedeId')?.setValue(String(sede.id))">
                <div>
                  <div class="fw-semibold">{{ sede.name }}</div>
                  <div class="opacity-75 small">{{ sede.address }}</div>
                </div>
                <span class="badge bg-warning text-dark">📍 {{ sede.dist }}</span>
              </button>
            </div>
            <div *ngIf="bookingForm.get('sedeId')?.invalid && bookingForm.get('sedeId')?.touched"
              class="text-danger small mt-1">Selecciona una sede</div>
          </div>

          <!-- Fecha -->
          <div class="mb-3">
            <label class="form-label fw-semibold small">
              <i class="bi bi-calendar3 me-1"></i>Fecha de la cita
            </label>
            <input type="date" class="form-control" formControlName="date" [min]="today"
              [class.is-invalid]="bookingForm.get('date')?.invalid && bookingForm.get('date')?.touched">
            <div class="invalid-feedback">Selecciona una fecha</div>
          </div>

          <!-- Horario -->
          <div class="mb-4">
            <label class="form-label fw-semibold small">
              <i class="bi bi-clock me-1"></i>Horario disponible
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button *ngFor="let t of timeSlots" type="button"
                class="btn btn-sm fw-semibold"
                [class.btn-primary]="bookingForm.get('time')?.value === t"
                [class.btn-outline-secondary]="bookingForm.get('time')?.value !== t"
                style="border-radius:10px;font-size:12px;"
                (click)="bookingForm.get('time')?.setValue(t)">
                {{ t }}
              </button>
            </div>
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
    </div>
  `,
})
export class AppointmentsComponent implements OnInit {
  pets$: Observable<Pet[]>;
  activeFilter = 'Todos';
  selectedService: ServiceItem | null = null;
  bookingForm!: FormGroup;
  loading = false;
  today = new Date().toISOString().split('T')[0];

  readonly filters = SERVICE_FILTERS;
  readonly allServices = ALL_SERVICES;
  readonly sedes: Sede[] = SEDES;
  readonly timeSlots = TIME_SLOTS;
  readonly String = String;

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
  ) {
    this.pets$ = this.petService.pets$;
  }

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      petId:  ['', Validators.required],
      sedeId: ['', Validators.required],
      date:   ['', Validators.required],
      time:   ['', Validators.required],
    });

    // Aplica filtro inicial desde query params (si viene del dashboard)
    this.route.queryParams.subscribe(params => {
      if (params['categoria'] && this.filters.includes(params['categoria'])) {
        this.activeFilter = params['categoria'];
      }
    });
  }

  openBooking(svc: ServiceItem): void {
    this.selectedService = svc;
    this.bookingForm.reset();
  }

  closeBooking(): void {
    this.selectedService = null;
    this.bookingForm.reset();
    this.loading = false;
  }

  async onConfirm(): Promise<void> {
    if (this.bookingForm.invalid) { this.bookingForm.markAllAsTouched(); return; }
    this.loading = true;

    await new Promise(r => setTimeout(r, 900)); // Simula procesamiento

    const { petId, sedeId, date, time } = this.bookingForm.value;
    const pets  = this.petService.pets;
    const pet   = pets.find(p => String(p.getId()) === petId);
    const sede  = this.sedes.find(s => String(s.id) === sedeId);

    const appointment: Appointment = {
      id:      Date.now(),
      service: this.selectedService!.name,
      pet:     pet?.getName() ?? 'Mi mascota',
      date,
      time,
      status:  'pending',
      icon:    this.selectedService!.emoji,
      vet:     sede?.name ?? 'Pettime',
      address: sede?.address ?? '',
    };

    this.appointmentService.addAppointment(appointment);
    this.closeBooking();
  }
}
