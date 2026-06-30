// ============================================================
// dashboard.component.ts — Home / Panel principal
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { PetService } from '../../core/services/pet.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputFieldComponent } from '../../shared/components/input-field/input-field.component';
import { User } from '../../models/user.model';
import { Pet, PetType, PetGender } from '../../models/pet.model';
import { Appointment } from '../../models/appointment.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Category { label: string; emoji: string; filter: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ServiceCardComponent, BottomNavComponent, ModalComponent, InputFieldComponent],
  template: `
    <div class="app-shell" style="max-width:430px;margin:0 auto;min-height:100vh;background:#f8f9fa;padding-bottom:80px;">

      <!-- Header con gradiente -->
      <div class="home-header text-white p-4 pb-5"
           style="background:linear-gradient(135deg,#32ACDC 0%,#1a8ab5 100%);border-radius:0 0 24px 24px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <img src="/Logo-PetTime.svg" alt="PetTime" style="height:44px;filter:brightness(10);" onerror="this.style.display='none'">
          <i class="bi bi-bell fs-5" style="cursor:pointer;"></i>
        </div>
        <p class="mb-1 opacity-75 small">¡Bienvenido!</p>
        <h2 class="fw-bold mb-3" style="font-size:22px;">Hola, {{ (user$ | async)?.name }} 👋</h2>

        <!-- Buscador -->
        <div class="position-relative">
          <i class="bi bi-search position-absolute" style="left:14px;top:50%;transform:translateY(-50%);color:#6c757d;z-index:1;"></i>
          <input type="text" class="form-control ps-5 border-0 shadow-sm"
            style="border-radius:12px;height:48px;" placeholder="Buscar servicios..."
            [formControl]="searchControl">

          <!-- Sugerencias dropdown -->
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

        <!-- Mis Mascotas -->
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

        <div *ngIf="(pets$ | async)?.length" class="d-flex gap-3 overflow-auto pb-2 mb-4" style="scrollbar-width:none;">
          <div *ngFor="let pet of (pets$ | async)"
            class="card border-0 shadow-sm text-center flex-shrink-0 p-3"
            style="width:100px;border-radius:16px;cursor:pointer;"
            (click)="selectedPet = pet">
            <div class="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
              style="width:52px;height:52px;background:linear-gradient(135deg,rgba(50,172,220,0.15),rgba(242,148,85,0.15));font-size:26px;">
              {{ pet.getEmoji() }}
            </div>
            <p class="mb-0 fw-bold" style="font-size:13px;color:#1a1a2e;">{{ pet.getName() }}</p>
            <p class="mb-1 text-muted" style="font-size:11px;">{{ pet.getRaza() }}</p>
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

        <!-- Próximas Citas -->
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
                style="border-radius:12px;" (click)="petForm.get('petType')?.setValue(pt.value)">
                <span style="font-size:22px;">{{ pt.emoji }}</span>
                <span style="font-size:12px;">{{ pt.label }}</span>
              </button>
            </div>
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

      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  user$: Observable<User | null>;
  pets$: Observable<Pet[]>;
  upcoming$: Observable<Appointment[]>;
  suggestions$!: Observable<string[]>;

  searchControl = new FormControl('');
  showAddPet = false;
  selectedPet: Pet | null = null;
  petForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];

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
    { label: 'Otro',  emoji: '🐰', value: 'otro'  },
  ];

  private readonly allServices = ['Vacuna Antirrábica','Baño y Secado','Corte de Pelo','Consulta General','Limpieza Dental','Desparasitación'];

  constructor(
    public readonly router: Router,
    private readonly authService: AuthService,
    private readonly petService: PetService,
    private readonly appointmentService: AppointmentService,
    private readonly fb: FormBuilder,
  ) {
    this.user$     = this.authService.currentUser$;
    this.pets$     = this.petService.pets$;
    this.upcoming$ = this.appointmentService.upcoming$;
  }

  ngOnInit(): void {
    this.petForm = this.fb.group({
      petName:  ['', [Validators.required, Validators.minLength(2)]],
      petType:  ['', Validators.required],
      sexo:     ['', Validators.required],
      raza:     ['', [Validators.required, Validators.minLength(2)]],
      fechaNac: [''],
    });

    this.suggestions$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      map(q => !q?.trim() ? [] : this.allServices.filter(s => s.toLowerCase().includes(q.toLowerCase()))),
    );
  }

  cancelAppointment(id: number): void {
    this.appointmentService.cancelAppointment(id);
  }

  onAddPet(): void {
    if (this.petForm.invalid) { this.petForm.markAllAsTouched(); return; }
    const v = this.petForm.value;
    this.petService.addPet({ name: v.petName, type: v.petType as PetType, raza: v.raza, sexo: v.sexo as PetGender, fechaNac: v.fechaNac ?? '' });
    this.showAddPet = false;
    this.petForm.reset();
  }

  getPetInfo(pet: Pet): { label: string; value: string }[] {
    return [
      { label: 'Tipo',           value: pet.getType().charAt(0).toUpperCase() + pet.getType().slice(1) },
      { label: 'Raza',           value: pet.getRaza() },
      { label: 'Edad',           value: pet.getAge() },
      { label: 'Fecha de nac.', value: pet.getFechaNac() || '—' },
    ];
  }
}
