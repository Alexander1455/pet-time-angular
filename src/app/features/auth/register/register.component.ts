// ============================================================
// register.component.ts
// Componente orquestador del wizard de registro.
// Soporta dos flujos: Dueño de Mascota (3 pasos) y Doctor (1 paso).
// ============================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PetService } from '../../../core/services/pet.service';
import { RegisterData, DoctorRegisterData } from '../../../models/user.model';
import { PetGender, PetType } from '../../../models/pet.model';
import { StepOneComponent } from './step-one/step-one.component';
import { StepTwoComponent } from './step-two/step-two.component';
import { StepThreeComponent } from './step-three/step-three.component';

type RegisterMode = 'choose' | 'client' | 'doctor';

const ALL_TIME_SLOTS = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '02:00 PM','03:00 PM','04:00 PM','05:00 PM',
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, StepOneComponent, StepTwoComponent, StepThreeComponent],
  template: `
    <div class="auth-container d-flex flex-column align-items-center justify-content-start min-vh-100 px-4 py-4"
         style="background: linear-gradient(160deg,#f0f9ff 0%,#fff 60%); max-width:430px; margin:0 auto;">

      <!-- Logo -->
      <img src="/Logo-PetTime.svg" alt="PetTime" class="mb-3" style="height:55px;" onerror="this.style.display='none'">

      <!-- ══════════════════════════════════════════════════ -->
      <!-- PASO 0: Elección de tipo de registro              -->
      <!-- ══════════════════════════════════════════════════ -->
      <ng-container *ngIf="mode === 'choose'">
        <div class="text-center mb-4 w-100">
          <h2 class="fw-bold mb-1" style="color:#1a1a2e; font-size:22px;">¿Cómo deseas registrarte?</h2>
          <p class="text-muted small">Selecciona el tipo de cuenta que necesitas</p>
        </div>

        <!-- Tarjeta: Dueño de Mascota -->
        <div class="card border-0 shadow-sm w-100 mb-3 p-4" style="border-radius:20px;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;"
          (click)="selectMode('client')"
          (mouseenter)="onHover($event,true)" (mouseleave)="onHover($event,false)">
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style="width:60px;height:60px;background:linear-gradient(135deg,rgba(50,172,220,0.15),rgba(242,148,85,0.15));font-size:30px;">
              🐾
            </div>
            <div>
              <h5 class="fw-bold mb-1" style="color:#1a1a2e;font-size:16px;">Dueño de Mascota</h5>
              <p class="text-muted small mb-0">Agenda citas, gestiona tus mascotas y revisa su historial clínico.</p>
            </div>
            <i class="bi bi-chevron-right text-muted ms-auto"></i>
          </div>
        </div>

        <!-- Tarjeta: Médico Veterinario -->
        <div class="card border-0 shadow-sm w-100 mb-4 p-4" style="border-radius:20px;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;"
          (click)="selectMode('doctor')"
          (mouseenter)="onHover($event,true)" (mouseleave)="onHover($event,false)">
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style="width:60px;height:60px;background:linear-gradient(135deg,rgba(25,135,84,0.15),rgba(50,172,220,0.15));font-size:30px;">
              🩺
            </div>
            <div>
              <h5 class="fw-bold mb-1" style="color:#1a1a2e;font-size:16px;">Médico Veterinario</h5>
              <p class="text-muted small mb-0">Accede a tu agenda de citas y registra fichas clínicas de tus pacientes.</p>
            </div>
            <i class="bi bi-chevron-right text-muted ms-auto"></i>
          </div>
        </div>

        <p class="text-muted small">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="fw-bold text-decoration-none" style="color:#F29455;">Inicia sesión</a>
        </p>
      </ng-container>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- FLUJO CLIENTE: Wizard de 3 pasos                  -->
      <!-- ══════════════════════════════════════════════════ -->
      <ng-container *ngIf="mode === 'client'">
        <!-- Título del paso -->
        <div class="text-center mb-3 w-100">
          <h2 class="fw-bold mb-1" style="color:#1a1a2e; font-size:22px;">{{ stepTitles[currentStep - 1] }}</h2>
          <p class="text-muted small">Paso {{ currentStep }} de 3</p>
        </div>

        <!-- Indicador de pasos -->
        <div class="d-flex align-items-center gap-2 mb-4 w-100 justify-content-center">
          <ng-container *ngFor="let s of [1,2,3]; let i = index">
            <div class="step-circle d-flex align-items-center justify-content-center fw-bold"
              [class.active]="currentStep === s"
              [class.completed]="currentStep > s">
              {{ currentStep > s ? '✓' : s }}
            </div>
            <div *ngIf="i < 2" class="step-line" [class.completed]="currentStep > s"></div>
          </ng-container>
        </div>

        <app-step-one *ngIf="currentStep === 1" (next)="onStepOneNext($event)"></app-step-one>
        <app-step-two *ngIf="currentStep === 2" (next)="onStepTwoNext($event)" (back)="onBack()"></app-step-two>
        <app-step-three *ngIf="currentStep === 3" [loading]="loading" (submit)="onStepThreeSubmit($event)" (back)="onBack()"></app-step-three>

        <p class="mt-4 text-muted small">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="fw-bold text-decoration-none" style="color:#F29455;">Inicia sesión</a>
        </p>
      </ng-container>

      <!-- ══════════════════════════════════════════════════ -->
      <!-- FLUJO DOCTOR: Formulario único                     -->
      <!-- ══════════════════════════════════════════════════ -->
      <ng-container *ngIf="mode === 'doctor'">
        <div class="text-center mb-4 w-100">
          <div style="font-size:48px;">🩺</div>
          <h2 class="fw-bold mb-1" style="color:#1a1a2e; font-size:22px;">Registro de Veterinario</h2>
          <p class="text-muted small">Configura tu perfil médico y disponibilidad</p>
        </div>

        <div class="card border-0 shadow-sm w-100 p-4" style="border-radius:20px;">
          <form [formGroup]="doctorForm" (ngSubmit)="onDoctorSubmit()">

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small"><i class="bi bi-envelope me-1"></i>Correo electrónico</label>
              <input type="email" class="form-control" formControlName="email" placeholder="correo@pettime.com"
                style="border-radius:10px;"
                [class.is-invalid]="doctorForm.get('email')?.invalid && doctorForm.get('email')?.touched">
              <div class="invalid-feedback">Ingresa un correo válido</div>
            </div>

            <!-- Contraseña -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small"><i class="bi bi-lock me-1"></i>Contraseña</label>
              <input type="password" class="form-control" formControlName="password" placeholder="Mínimo 6 caracteres"
                style="border-radius:10px;"
                [class.is-invalid]="doctorForm.get('password')?.invalid && doctorForm.get('password')?.touched">
              <div class="invalid-feedback">Mínimo 6 caracteres</div>
            </div>

            <!-- Nombres y Apellidos -->
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label fw-semibold text-secondary small">Nombres</label>
                <input type="text" class="form-control" formControlName="nombres" placeholder="Nombres"
                  style="border-radius:10px;"
                  [class.is-invalid]="doctorForm.get('nombres')?.invalid && doctorForm.get('nombres')?.touched">
                <div class="invalid-feedback">Requerido</div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold text-secondary small">Apellidos</label>
                <input type="text" class="form-control" formControlName="apellidos" placeholder="Apellidos"
                  style="border-radius:10px;"
                  [class.is-invalid]="doctorForm.get('apellidos')?.invalid && doctorForm.get('apellidos')?.touched">
                <div class="invalid-feedback">Requerido</div>
              </div>
            </div>

            <!-- Especialidad -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small"><i class="bi bi-award me-1"></i>Especialidad</label>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" *ngFor="let sp of specialties"
                  class="btn btn-sm fw-semibold"
                  [class.btn-primary]="doctorForm.get('specialty')?.value === sp.value"
                  [class.btn-outline-secondary]="doctorForm.get('specialty')?.value !== sp.value"
                  style="border-radius:20px;font-size:12px;"
                  (click)="doctorForm.get('specialty')?.setValue(sp.value)">
                  {{ sp.emoji }} {{ sp.label }}
                </button>
              </div>
              <div *ngIf="doctorForm.get('specialty')?.invalid && doctorForm.get('specialty')?.touched"
                class="text-danger small mt-1">
                <i class="bi bi-exclamation-circle-fill"></i> Selecciona una especialidad
              </div>
            </div>

            <!-- Disponibilidad horaria -->
            <div class="mb-4">
              <label class="form-label fw-semibold text-secondary small"><i class="bi bi-clock me-1"></i>Horarios de atención disponibles</label>
              <div class="d-flex flex-wrap gap-2">
                <button type="button" *ngFor="let slot of allTimeSlots"
                  class="btn btn-sm fw-semibold"
                  [class.btn-primary]="isSlotSelected(slot)"
                  [class.btn-outline-secondary]="!isSlotSelected(slot)"
                  style="border-radius:10px;font-size:12px;"
                  (click)="toggleSlot(slot)">
                  {{ slot }}
                </button>
              </div>
              <div *ngIf="selectedSlots.length === 0 && slotsSubmitAttempted"
                class="text-danger small mt-1">
                <i class="bi bi-exclamation-circle-fill"></i> Selecciona al menos un horario
              </div>
            </div>

            <!-- Botones -->
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary py-3 px-4" style="border-radius:12px;"
                (click)="mode = 'choose'">
                <i class="bi bi-arrow-left"></i>
              </button>
              <button type="submit" class="btn flex-fill fw-bold py-3"
                style="background:linear-gradient(135deg,#198754,#0d6efd);color:#fff;border-radius:12px;border:none;"
                [disabled]="loading">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Registrando...' : '🩺 Registrar como Veterinario' }}
              </button>
            </div>
          </form>
        </div>

        <p class="mt-4 text-muted small">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login" class="fw-bold text-decoration-none" style="color:#F29455;">Inicia sesión</a>
        </p>
      </ng-container>
    </div>
  `,
  styles: [`
    .step-circle {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: #e9ecef;
      color: #6c757d;
      font-size: 13px;
      transition: all 0.3s;
    }
    .step-circle.active {
      background: #32ACDC;
      color: #fff;
      box-shadow: 0 3px 10px rgba(50,172,220,0.4);
    }
    .step-circle.completed {
      background: #198754;
      color: #fff;
    }
    .step-line {
      flex: 1; height: 2px;
      background: #dee2e6;
      max-width: 40px;
      transition: background 0.3s;
    }
    .step-line.completed { background: #198754; }
  `],
})
export class RegisterComponent {
  mode: RegisterMode = 'choose';
  currentStep = 1;
  loading = false;
  formData: Partial<RegisterData> = {};
  doctorForm!: FormGroup;
  selectedSlots: string[] = [];
  slotsSubmitAttempted = false;

  readonly stepTitles = ['Datos de acceso', 'Datos del dueño', 'Tu mascota'];
  readonly allTimeSlots = ALL_TIME_SLOTS;

  readonly specialties = [
    { label: 'Consulta', emoji: '🩺', value: 'Consulta' },
    { label: 'Vacunas',  emoji: '💉', value: 'Vacunas' },
    { label: 'Dental',   emoji: '🦷', value: 'Dental' },
    { label: 'Baño',     emoji: '🛁', value: 'Baño' },
    { label: 'Corte',    emoji: '✂️', value: 'Corte' },
    { label: 'Todos',    emoji: '🏥', value: 'Todos' },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly petService: PetService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
  ) {
    this.doctorForm = this.fb.group({
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      nombres:   ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      specialty: ['', Validators.required],
    });
  }

  selectMode(m: 'client' | 'doctor'): void {
    this.mode = m;
    this.currentStep = 1;
    this.formData = {};
    this.selectedSlots = [];
    this.slotsSubmitAttempted = false;
    this.doctorForm.reset();
  }

  // ── Flujo Cliente ──────────────────────────────────────────

  onStepOneNext(data: Partial<RegisterData>): void {
    this.formData = { ...this.formData, ...data };
    this.currentStep = 2;
  }

  onStepTwoNext(data: Partial<RegisterData>): void {
    this.formData = { ...this.formData, ...data };
    this.currentStep = 3;
  }

  async onStepThreeSubmit(data: Partial<RegisterData>): Promise<void> {
    const finalData = { ...this.formData, ...data } as RegisterData;
    this.loading = true;
    try {
      await this.authService.register(finalData);
      this.petService.addPet({
        name: finalData.petName,
        type: finalData.petType as PetType,
        raza: finalData.raza,
        sexo: finalData.sexo as PetGender,
        fechaNac: finalData.fechaNac,
        otherDetails: finalData.petOtherDetails,
      });
      this.router.navigate(['/app/dashboard']);
    } finally {
      this.loading = false;
    }
  }

  onBack(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // ── Flujo Doctor ───────────────────────────────────────────

  isSlotSelected(slot: string): boolean {
    return this.selectedSlots.includes(slot);
  }

  toggleSlot(slot: string): void {
    if (this.isSlotSelected(slot)) {
      this.selectedSlots = this.selectedSlots.filter(s => s !== slot);
    } else {
      this.selectedSlots = [...this.selectedSlots, slot];
    }
  }

  async onDoctorSubmit(): Promise<void> {
    this.slotsSubmitAttempted = true;
    if (this.doctorForm.invalid || this.selectedSlots.length === 0) {
      this.doctorForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      const v = this.doctorForm.value;
      const data: DoctorRegisterData = {
        email: v.email,
        password: v.password,
        nombres: v.nombres,
        apellidos: v.apellidos,
        specialty: v.specialty,
        availabilities: [...this.selectedSlots].sort(),
      };
      await this.authService.registerDoctor(data);
      this.router.navigate(['/app/dashboard']);
    } finally {
      this.loading = false;
    }
  }

  onHover(event: MouseEvent, isEnter: boolean): void {
    const el = event.currentTarget as HTMLElement;
    el.style.transform = isEnter ? 'translateY(-2px)' : 'translateY(0)';
    el.style.boxShadow = isEnter ? '0 8px 25px rgba(50,172,220,0.2)' : '';
  }
}
