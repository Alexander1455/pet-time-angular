// ============================================================
// dashboard.component.ts — Panel principal con vista por rol
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { PetService } from '../../core/services/pet.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DemoSwitcherComponent } from '../../shared/components/demo-switcher/demo-switcher.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputFieldComponent } from '../../shared/components/input-field/input-field.component';
import { User } from '../../models/user.model';
import { Pet, PetType, PetGender } from '../../models/pet.model';
import { Appointment, MedicalRecord } from '../../models/appointment.model';

interface Category { label: string; emoji: string; filter: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ServiceCardComponent,
    BottomNavComponent, SidebarComponent, DemoSwitcherComponent, ModalComponent, InputFieldComponent],
  template: `
    <div class="page-layout">
      <app-sidebar></app-sidebar>

      <div class="page-content" *ngIf="user$ | async as user">

        <!-- ════════════════════════════════════════════════ -->
        <!-- VISTA DOCTOR                                     -->
        <!-- ════════════════════════════════════════════════ -->
        <ng-container *ngIf="user.role === 'doctor'">

          <!-- Header Doctor -->
          <div class="home-header text-white p-4 pb-5"
            style="background:linear-gradient(135deg,#198754 0%,#0d6efd 100%);border-radius:0 0 24px 24px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <img src="/Logo-PetTime.svg" alt="PetTime" style="height:44px;filter:brightness(10);" onerror="this.style.display='none'">
              <span class="badge bg-light text-success fw-bold">🩺 Veterinario</span>
            </div>
            <p class="mb-1 opacity-75 small">Panel Médico</p>
            <h2 class="fw-bold mb-1" style="font-size:22px;">{{ user.name }}</h2>
            <p class="mb-0 opacity-75 small">Especialidad: <strong class="text-white">{{ user.specialty }}</strong></p>
          </div>

          <div class="px-3 pt-3">

            <!-- Stats Doctor -->
            <div class="doctor-stats-grid mb-4">
              <div class="doctor-stat-card">
                <div class="doctor-stat-icon" style="background:rgba(25,135,84,0.1);color:#198754;">📅</div>
                <div>
                  <p class="doctor-stat-num" style="color:#198754;">{{ (doctorAppointments$ | async)?.length ?? 0 }}</p>
                  <p class="doctor-stat-label">Pendientes</p>
                </div>
              </div>
              <div class="doctor-stat-card">
                <div class="doctor-stat-icon" style="background:rgba(13,110,253,0.1);color:#0d6efd;">✅</div>
                <div>
                  <p class="doctor-stat-num" style="color:#0d6efd;">{{ (doctorHistory$ | async)?.length ?? 0 }}</p>
                  <p class="doctor-stat-label">Completadas</p>
                </div>
              </div>
            </div>

            <!-- Agenda del Doctor -->
            <h3 class="fw-bold mb-3" style="font-size:16px;color:#1a1a2e;">📋 Mi Agenda de Citas</h3>

            <div *ngIf="(doctorAppointments$ | async)?.length === 0" class="text-center py-5 text-muted">
              <div style="font-size:56px;">📭</div>
              <p class="fw-semibold">Sin citas asignadas</p>
              <p class="small">Tus citas aparecerán aquí cuando los clientes agenden contigo</p>
            </div>

            <!-- Tarjetas de citas del doctor -->
            <div *ngFor="let apt of (doctorAppointments$ | async)"
              class="card border-0 shadow-sm mb-3"
              style="border-radius:16px;overflow:hidden;">
              <div class="card-body p-3">
                <div class="d-flex align-items-start gap-3">
                  <div class="d-flex align-items-center justify-content-center flex-shrink-0"
                    style="width:52px;height:52px;border-radius:14px;font-size:24px;"
                    [style.background]="apt.status === 'pending' ? 'rgba(255,193,7,0.12)' : 'rgba(25,135,84,0.12)'">
                    {{ apt.icon }}
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h6 class="mb-0 fw-bold" style="color:#1a1a2e;font-size:14px;">{{ apt.service }}</h6>
                      <span class="badge" [style.background]="apt.status === 'pending' ? '#fff3cd' : '#d1e7dd'"
                        [style.color]="apt.status === 'pending' ? '#856404' : '#0f5132'" style="font-size:10px;">
                        {{ apt.status === 'pending' ? '⏳ Pendiente' : '✅ Confirmada' }}
                      </span>
                    </div>
                    <p class="mb-1 small text-muted">🐾 Paciente: <strong>{{ apt.pet }}</strong></p>
                    <p class="mb-1 small text-muted">📅 {{ apt.date }} &nbsp;⏰ {{ apt.time }}</p>
                  </div>
                </div>

                <!-- Botones acción doctor -->
                <div class="d-flex gap-2 mt-3">
                  <button *ngIf="apt.status === 'pending'" type="button"
                    class="btn btn-outline-primary btn-sm flex-fill fw-semibold" style="border-radius:10px;font-size:12px;"
                    (click)="confirmApt(apt.id)">
                    <i class="bi bi-check-circle me-1"></i>Confirmar
                  </button>
                  <button *ngIf="apt.status === 'confirmed'" type="button"
                    class="btn btn-success btn-sm flex-fill fw-semibold" style="border-radius:10px;font-size:12px;"
                    (click)="openMedicalRecord(apt)">
                    <i class="bi bi-clipboard2-pulse me-1"></i>Atender & Registrar Ficha
                  </button>
                  <button type="button"
                    class="btn btn-outline-danger btn-sm fw-semibold" style="border-radius:10px;font-size:12px;padding:6px 12px;"
                    (click)="cancelApt(apt.id)">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ════════════════════════════════════════════════ -->
        <!-- VISTA CLIENTE                                    -->
        <!-- ════════════════════════════════════════════════ -->
        <ng-container *ngIf="user.role !== 'doctor'">

          <!-- Header cliente con gradiente -->
          <div class="home-header text-white p-4 pb-5"
            style="background:linear-gradient(135deg,#32ACDC 0%,#1a8ab5 100%);border-radius:0 0 24px 24px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <img src="/Logo-PetTime.svg" alt="PetTime" style="height:44px;filter:brightness(10);" onerror="this.style.display='none'">
              <i class="bi bi-bell fs-5" style="cursor:pointer;"></i>
            </div>
            <p class="mb-1 opacity-75 small">¡Bienvenido!</p>
            <h2 class="fw-bold mb-3" style="font-size:22px;">Hola, {{ user.name }} 👋</h2>

            <!-- Buscador -->
            <div class="position-relative">
              <i class="bi bi-search position-absolute" style="left:14px;top:50%;transform:translateY(-50%);color:#6c757d;z-index:1;"></i>
              <input type="text" class="form-control ps-5 border-0 shadow-sm"
                style="border-radius:12px;height:48px;" placeholder="Buscar servicios..."
                [formControl]="searchControl">
              <div *ngIf="(suggestions$ | async)?.length"
                class="position-absolute w-100 bg-white rounded-3 shadow-lg"
                style="top:calc(100% + 6px);z-index:50;overflow:hidden;">
                <div *ngFor="let s of (suggestions$ | async)"
                  class="px-3 py-2 border-bottom small"
                  style="cursor:pointer;transition:background 0.15s;"
                  (click)="router.navigate(['/app/appointments'])">
                  🔍 {{ s }}
                </div>
              </div>
            </div>
          </div>

          <div class="px-3 pt-3">

            <!-- Categorías -->
            <h3 class="fw-bold mb-3" style="font-size:16px;color:#1a1a2e;">Servicios</h3>
            <div class="d-flex gap-3 overflow-auto pb-2 mb-4" style="scrollbar-width:none;">
              <div *ngFor="let cat of categories" class="text-center flex-shrink-0" style="cursor:pointer;"
                (click)="router.navigate(['/app/appointments'], {queryParams:{categoria:cat.filter}})">
                <div class="d-flex align-items-center justify-content-center rounded-3 mb-1"
                  style="width:60px;height:60px;background:rgba(50,172,220,0.1);font-size:26px;">
                  {{ cat.emoji }}
                </div>
                <span class="text-muted" style="font-size:11px;font-weight:500;">{{ cat.label }}</span>
              </div>
            </div>

            <!-- Dashboard grid en escritorio -->
            <div class="dashboard-grid">

              <!-- Mis Mascotas -->
              <div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="fw-bold mb-0" style="font-size:16px;color:#1a1a2e;">Mis Mascotas</h3>
                  <button class="btn btn-link p-0 small fw-bold" style="color:#32ACDC;" (click)="showAddPet=true">
                    <i class="bi bi-plus-circle me-1"></i>Agregar
                  </button>
                </div>

                <div *ngIf="(pets$ | async)?.length === 0" class="text-center py-4 text-muted" (click)="showAddPet=true" style="cursor:pointer;">
                  <div style="font-size:40px;">🐾</div>
                  <p class="small">Toca aquí para agregar tu primera mascota</p>
                </div>

                <div *ngIf="(pets$ | async)?.length" class="d-flex gap-3 overflow-auto pb-2 mb-2" style="scrollbar-width:none;">
                  <div *ngFor="let pet of (pets$ | async)"
                    class="card border-0 shadow-sm text-center flex-shrink-0 p-3"
                    style="width:100px;border-radius:16px;cursor:pointer;"
                    (click)="selectedPet = pet">
                    <div class="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
                      style="width:52px;height:52px;background:linear-gradient(135deg,rgba(50,172,220,0.15),rgba(242,148,85,0.15));font-size:26px;">
                      {{ pet.getEmoji() }}
                    </div>
                    <p class="mb-0 fw-bold" style="font-size:13px;color:#1a1a2e;">{{ pet.getName() }}</p>
                    <p class="mb-1 text-muted" style="font-size:10px;">{{ pet.getTypeLabel() }}</p>
                    <span class="badge" style="font-size:10px;"
                      [style.background]="pet.getSexo() === 'Macho' ? 'rgba(50,172,220,0.15)' : 'rgba(242,148,85,0.15)'"
                      [style.color]="pet.getSexo() === 'Macho' ? '#32ACDC' : '#F29455'">
                      {{ pet.getSexo() }}
                    </span>
                  </div>
                  <!-- Botón + nueva mascota -->
                  <div class="card border-0 flex-shrink-0 text-center p-3 d-flex flex-column align-items-center justify-content-center"
                    style="width:100px;border-radius:16px;border:2px dashed #dee2e6!important;cursor:pointer;"
                    (click)="showAddPet=true">
                    <div class="d-flex align-items-center justify-content-center rounded-circle mb-2"
                      style="width:52px;height:52px;background:rgba(50,172,220,0.08);">
                      <i class="bi bi-plus fs-4" style="color:#32ACDC;"></i>
                    </div>
                    <p class="mb-0 small fw-semibold" style="color:#32ACDC;">Nueva</p>
                  </div>
                </div>
              </div>

              <!-- Próximas Citas -->
              <div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="fw-bold mb-0" style="font-size:16px;color:#1a1a2e;">Próximas Citas</h3>
                  <button class="btn btn-link p-0 small fw-bold" style="color:#32ACDC;" (click)="router.navigate(['/app/history'])">
                    Ver todas →
                  </button>
                </div>

                <div *ngIf="(upcoming$ | async)?.length === 0" class="text-center py-4 text-muted">
                  <div style="font-size:48px;">📅</div>
                  <p class="fw-semibold">Sin citas programadas</p>
                  <p class="small">¡Agenda un servicio para tu mascota!</p>
                </div>

                <app-service-card
                  *ngFor="let apt of (upcoming$ | async)"
                  [appointment]="apt"
                  actionLabel="Cancelar cita"
                  (action)="cancelAppointment($event)">
                </app-service-card>
              </div>
            </div>
          </div>

          <!-- Modal: Info de mascota -->
          <app-modal *ngIf="selectedPet" [title]="selectedPet.getEmoji() + ' ' + selectedPet.getName()" (closed)="selectedPet=null">
            <div class="text-center mb-4">
              <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style="width:90px;height:90px;background:linear-gradient(135deg,rgba(50,172,220,0.15),rgba(242,148,85,0.15));font-size:44px;">
                {{ selectedPet.getEmoji() }}
              </div>
              <h5 class="fw-bold">{{ selectedPet.getName() }}</h5>
              <span class="badge rounded-pill px-3" style="font-size:12px;"
                [style.background]="selectedPet.getSexo()==='Macho' ? 'rgba(50,172,220,0.15)' : 'rgba(242,148,85,0.15)'"
                [style.color]="selectedPet.getSexo()==='Macho' ? '#32ACDC' : '#F29455'">
                {{ selectedPet.getSexo() === 'Macho' ? '♂️' : '♀️' }} {{ selectedPet.getSexo() }}
              </span>
            </div>
            <div class="row g-2">
              <div class="col-6" *ngFor="let info of getPetInfo(selectedPet)">
                <div class="p-3 rounded-3" style="background:rgba(50,172,220,0.05);">
                  <p class="text-muted mb-1" style="font-size:11px;font-weight:500;">{{ info.label }}</p>
                  <p class="fw-bold mb-0" style="font-size:14px;color:#1a1a2e;">{{ info.value }}</p>
                </div>
              </div>
            </div>
          </app-modal>

          <!-- Modal: Agregar mascota -->
          <app-modal *ngIf="showAddPet" title="🐾 Agregar Mascota" (closed)="showAddPet=false;petForm.reset()">
            <form [formGroup]="petForm" (ngSubmit)="onAddPet()">
              <app-input-field label="Nombre" type="text" icon="bi-heart"
                placeholder="Nombre de la mascota" [control]="petForm.get('petName')">
              </app-input-field>

              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">Tipo de mascota</label>
                <div class="d-flex gap-2">
                  <button type="button" *ngFor="let pt of petTypes"
                    class="btn flex-fill flex-column py-2"
                    [class.btn-primary]="petForm.get('petType')?.value === pt.value"
                    [class.btn-outline-secondary]="petForm.get('petType')?.value !== pt.value"
                    style="border-radius:12px;" (click)="selectPetTypeModal(pt.value)">
                    <span style="font-size:22px;">{{ pt.emoji }}</span>
                    <span style="font-size:12px;">{{ pt.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Campo condicional para tipo "Otro" -->
              <div *ngIf="petForm.get('petType')?.value === 'otro'" class="mb-3 animate-fadeIn">
                <label class="form-label fw-semibold text-secondary small">
                  <i class="bi bi-pencil me-1"></i>¿Qué tipo de mascota es?
                </label>
                <input type="text" class="form-control" formControlName="petOtherDetails"
                  placeholder="Ej: Conejo, Hámster, Loro..."
                  style="border-radius:10px;"
                  [class.is-invalid]="petForm.get('petOtherDetails')?.invalid && petForm.get('petOtherDetails')?.touched">
                <div class="invalid-feedback">Por favor especifica el tipo</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">Sexo</label>
                <div class="d-flex gap-2">
                  <button type="button" *ngFor="let s of ['Macho','Hembra']"
                    class="btn flex-fill py-2"
                    [class.btn-primary]="petForm.get('sexo')?.value === s"
                    [class.btn-outline-secondary]="petForm.get('sexo')?.value !== s"
                    style="border-radius:10px;" (click)="petForm.get('sexo')?.setValue(s)">
                    {{ s === 'Macho' ? '♂️' : '♀️' }} {{ s }}
                  </button>
                </div>
              </div>

              <app-input-field label="Raza" type="text" icon="bi-tag"
                placeholder="Ej: Labrador" [control]="petForm.get('raza')">
              </app-input-field>

              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary small">Fecha de nacimiento</label>
                <input type="date" class="form-control" formControlName="fechaNac" [max]="today">
              </div>

              <button type="submit" class="btn w-100 fw-bold py-3"
                style="background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;border-radius:12px;border:none;">
                <i class="bi bi-plus-circle me-2"></i>Agregar mascota
              </button>
            </form>
          </app-modal>
        </ng-container>

        <!-- Modal: Ficha Clínica (Doctor) -->
        <app-modal *ngIf="showMedicalRecord && selectedAppointment"
          title="📋 Ficha Clínica — {{ selectedAppointment.service }}"
          (closed)="closeMedicalRecord()">
          <div class="mb-3 p-3 rounded-3" style="background:rgba(25,135,84,0.06);border:1px solid rgba(25,135,84,0.15);">
            <p class="small fw-semibold mb-1" style="color:#198754;">🐾 Paciente: {{ selectedAppointment.pet }}</p>
            <p class="small text-muted mb-0">📅 {{ selectedAppointment.date }} &nbsp;⏰ {{ selectedAppointment.time }}</p>
          </div>

          <form [formGroup]="medicalForm" (ngSubmit)="onSaveMedicalRecord()">
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">🏥 Tratamiento realizado *</label>
              <textarea class="form-control" formControlName="treatment" rows="2"
                placeholder="Describe el procedimiento o tratamiento aplicado..."
                style="border-radius:10px;resize:none;"
                [class.is-invalid]="medicalForm.get('treatment')?.invalid && medicalForm.get('treatment')?.touched">
              </textarea>
              <div class="invalid-feedback">Este campo es requerido</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">💊 Medicamentos / Insumos utilizados *</label>
              <textarea class="form-control" formControlName="medications" rows="2"
                placeholder="Lista los medicamentos, vacunas o insumos usados..."
                style="border-radius:10px;resize:none;"
                [class.is-invalid]="medicalForm.get('medications')?.invalid && medicalForm.get('medications')?.touched">
              </textarea>
              <div class="invalid-feedback">Este campo es requerido</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small">⚠️ Reacciones observadas</label>
              <textarea class="form-control" formControlName="reactions" rows="2"
                placeholder="Indica si hubo reacciones adversas o si todo fue normal..."
                style="border-radius:10px;resize:none;">
              </textarea>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold text-secondary small">📝 Recomendaciones para el dueño *</label>
              <textarea class="form-control" formControlName="recommendations" rows="2"
                placeholder="Indicaciones de cuidado posterior, seguimiento, etc."
                style="border-radius:10px;resize:none;"
                [class.is-invalid]="medicalForm.get('recommendations')?.invalid && medicalForm.get('recommendations')?.touched">
              </textarea>
              <div class="invalid-feedback">Este campo es requerido</div>
            </div>

            <button type="submit" class="btn w-100 fw-bold py-3"
              style="background:linear-gradient(135deg,#198754,#0d6efd);color:#fff;border-radius:12px;border:none;"
              [disabled]="medicalLoading">
              <span *ngIf="medicalLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ medicalLoading ? 'Guardando...' : '✅ Guardar Ficha y Completar Cita' }}
            </button>
          </form>
        </app-modal>

        <app-bottom-nav></app-bottom-nav>
        <app-demo-switcher></app-demo-switcher>
      </div>
    </div>
  `,
  styles: [`
    .page-layout { display: flex; min-height: 100vh; }
    .page-content { flex: 1; background: #f8f9fa; padding-bottom: 80px; }
    @media (min-width: 768px) {
      .page-content { margin-left: 240px; padding-bottom: 0; }
    }
    .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
    @media (min-width: 992px) {
      .dashboard-grid { grid-template-columns: 1fr 1fr; gap: 0 24px; }
    }
    .doctor-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .doctor-stat-card {
      background: #fff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .doctor-stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .doctor-stat-num { font-size: 26px; font-weight: 800; margin: 0; }
    .doctor-stat-label { font-size: 11px; color: #6c757d; margin: 0; font-weight: 500; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
    .animate-fadeIn { animation: fadeIn 0.25s ease forwards; }
  `],
})
export class DashboardComponent implements OnInit {
  user$: Observable<User | null>;
  pets$: Observable<Pet[]>;
  upcoming$: Observable<Appointment[]>;
  suggestions$!: Observable<string[]>;
  doctorAppointments$!: Observable<Appointment[]>;
  doctorHistory$!: Observable<Appointment[]>;

  searchControl = new FormControl('');
  showAddPet = false;
  selectedPet: Pet | null = null;
  petForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];

  showMedicalRecord = false;
  selectedAppointment: Appointment | null = null;
  medicalForm!: FormGroup;
  medicalLoading = false;

  readonly categories: Category[] = [
    { label: 'Vacunas',  emoji: '💉', filter: 'Vacunas'  },
    { label: 'Baño',     emoji: '🛁', filter: 'Baño'     },
    { label: 'Corte',    emoji: '✂️', filter: 'Corte'    },
    { label: 'Consulta', emoji: '🩺', filter: 'Consulta' },
    { label: 'Dental',   emoji: '🦷', filter: 'Dental'   },
  ];

  readonly petTypes = [
    { label: 'Perro', emoji: '🐶', value: 'perro' },
    { label: 'Gato',  emoji: '🐱', value: 'gato'  },
    { label: 'Otro',  emoji: '🐾', value: 'otro'  },
  ];

  private readonly allServices = ['Vacuna Antirrábica','Baño y Secado','Corte de Pelo','Consulta General','Limpieza Dental','Desparasitación'];

  constructor(
    public readonly router: Router,
    private readonly authService: AuthService,
    private readonly petService: PetService,
    private readonly appointmentService: AppointmentService,
    private readonly doctorService: DoctorService,
    private readonly fb: FormBuilder,
  ) {
    this.user$     = this.authService.currentUser$;
    this.pets$     = this.petService.pets$;
    this.upcoming$ = this.appointmentService.upcoming$;
  }

  ngOnInit(): void {
    this.petForm = this.fb.group({
      petName:         ['', [Validators.required, Validators.minLength(2)]],
      petType:         ['', Validators.required],
      petOtherDetails: [''],
      sexo:            ['', Validators.required],
      raza:            ['', [Validators.required, Validators.minLength(2)]],
      fechaNac:        [''],
    });

    this.medicalForm = this.fb.group({
      treatment:       ['', Validators.required],
      medications:     ['', Validators.required],
      reactions:       [''],
      recommendations: ['', Validators.required],
    });

    this.suggestions$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      map(q => !q?.trim() ? [] : this.allServices.filter(s => s.toLowerCase().includes(q.toLowerCase()))),
    );

    // Suscribir a las citas del doctor según el ID del usuario actual
    const user = this.authService.currentUser;
    if (user?.role === 'doctor' && user.doctorId) {
      this.doctorAppointments$ = this.appointmentService.getDoctorAppointments(user.doctorId);
      this.doctorHistory$ = this.appointmentService.getDoctorHistory(user.doctorId);
    } else {
      this.doctorAppointments$ = this.appointmentService.upcoming$.pipe(map(() => []));
      this.doctorHistory$ = this.appointmentService.history$.pipe(map(() => []));
    }

    // Actualizar cuando cambia el usuario (demo switcher)
    this.user$.subscribe(user => {
      if (user?.role === 'doctor' && user.doctorId) {
        this.doctorAppointments$ = this.appointmentService.getDoctorAppointments(user.doctorId);
        this.doctorHistory$ = this.appointmentService.getDoctorHistory(user.doctorId);
      }
    });
  }

  // ── Acciones Doctor ─────────────────────────────────────────

  confirmApt(id: number): void {
    this.appointmentService.confirmAppointment(id);
  }

  cancelApt(id: number): void {
    this.appointmentService.cancelAppointment(id);
  }

  openMedicalRecord(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.showMedicalRecord = true;
    this.medicalForm.reset();
  }

  closeMedicalRecord(): void {
    this.showMedicalRecord = false;
    this.selectedAppointment = null;
    this.medicalLoading = false;
  }

  async onSaveMedicalRecord(): Promise<void> {
    if (this.medicalForm.invalid) { this.medicalForm.markAllAsTouched(); return; }
    if (!this.selectedAppointment) return;

    this.medicalLoading = true;
    await new Promise(r => setTimeout(r, 800));

    const record: MedicalRecord = {
      ...this.medicalForm.value,
      attendedAt: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
    };

    this.appointmentService.registerMedicalRecord(this.selectedAppointment.id, record);
    this.medicalLoading = false;
    this.closeMedicalRecord();
  }

  // ── Acciones Cliente ───────────────────────────────────────

  cancelAppointment(id: number): void {
    this.appointmentService.cancelAppointment(id);
  }

  selectPetTypeModal(value: string): void {
    this.petForm.get('petType')?.setValue(value);
    const otherCtrl = this.petForm.get('petOtherDetails');
    if (value === 'otro') {
      otherCtrl?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      otherCtrl?.clearValidators();
      otherCtrl?.setValue('');
    }
    otherCtrl?.updateValueAndValidity();
  }

  onAddPet(): void {
    if (this.petForm.invalid) { this.petForm.markAllAsTouched(); return; }
    const v = this.petForm.value;
    this.petService.addPet({
      name: v.petName,
      type: v.petType as PetType,
      raza: v.raza,
      sexo: v.sexo as PetGender,
      fechaNac: v.fechaNac ?? '',
      otherDetails: v.petOtherDetails || undefined,
    });
    this.showAddPet = false;
    this.petForm.reset();
  }

  getPetInfo(pet: Pet): { label: string; value: string }[] {
    return [
      { label: 'Tipo',           value: pet.getTypeLabel() },
      { label: 'Raza',           value: pet.getRaza() },
      { label: 'Edad',           value: pet.getAge() },
      { label: 'Fecha de nac.', value: pet.getFechaNac() || '—' },
    ];
  }
}
