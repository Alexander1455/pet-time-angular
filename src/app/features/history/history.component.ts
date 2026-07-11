// ============================================================
// history.component.ts — Historial y gestión de citas
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { PetService } from '../../core/services/pet.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DemoSwitcherComponent } from '../../shared/components/demo-switcher/demo-switcher.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AppointmentStatusPipe, StatusBadgeClassPipe } from '../../shared/pipes/appointment-status.pipe';
import { HighlightAppointmentDirective } from '../../shared/directives/highlight-appointment.directive';
import { Appointment, MedicalRecord } from '../../models/appointment.model';
import { User } from '../../models/user.model';
import { Pet } from '../../models/pet.model';

type HistoryTab = 'todos' | 'completed' | 'cancelled';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    BottomNavComponent,
    SidebarComponent,
    DemoSwitcherComponent,
    ModalComponent,
    AppointmentStatusPipe,
    StatusBadgeClassPipe,
    HighlightAppointmentDirective,
  ],
  template: `
    <div class="page-layout">
      <app-sidebar></app-sidebar>

      <div class="page-content" *ngIf="user$ | async as user">

        <!-- Header -->
        <div class="p-4 bg-white border-bottom">
          <h1 class="fw-bold mb-1" style="color:#1a1a2e;font-size:22px;">
            {{ user.role === 'doctor' ? 'Historial de Pacientes 📋' : 'Historial 📋' }}
          </h1>
          <p class="text-muted small mb-0">
            {{ user.role === 'doctor' ? 'Pacientes atendidos y fichas clínicas' : 'Gestiona tus citas y revisa tu historial' }}
          </p>
        </div>

        <!-- CONTENIDO CLIENTE -->
        <div class="px-3 pt-3" *ngIf="user.role !== 'doctor'">

          <!-- Sección: Citas Pendientes (solo cliente) -->
          <ng-container *ngIf="(appointments$ | async)?.length">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0" style="color:#1a1a2e;font-size:15px;">📅 Citas Pendientes</h5>
              <span class="badge bg-warning text-dark">{{ (appointments$ | async)?.length }} cita(s)</span>
            </div>

            <div *ngFor="let apt of (appointments$ | async)"
              class="card border-0 shadow-sm mb-3"
              [appHighlightAppointment]="apt.date"
              style="border-radius:14px;overflow:hidden;">
              <div class="card-body p-3">
                <div class="d-flex align-items-start gap-3">
                  <div class="d-flex align-items-center justify-content-center flex-shrink-0"
                    style="width:52px;height:52px;border-radius:14px;font-size:24px;"
                    [style.background]="apt.status === 'pending' ? 'rgba(242,148,85,0.12)' : 'rgba(50,172,220,0.12)'">
                    {{ apt.icon }}
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h6 class="mb-0 fw-bold appt-title" style="color:#1a1a2e;font-size:14px;">{{ apt.service }}</h6>
                      <span [class]="apt.status | statusBadgeClass" style="font-size:11px;">
                        {{ apt.status | appointmentStatus }}
                      </span>
                    </div>
                    <p class="mb-1 small text-muted">🐾 {{ apt.pet }}</p>
                    <p class="mb-1 small text-muted">📅 {{ apt.date }}&nbsp;⏰ {{ apt.time }}</p>
                    <p class="mb-0 small text-muted">🩺 {{ apt.doctorName ?? apt.vet }}</p>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button *ngIf="apt.status === 'pending'" type="button"
                    class="btn btn-outline-primary btn-sm flex-fill fw-semibold" style="border-radius:10px;font-size:12px;"
                    (click)="confirm(apt.id)">
                    <i class="bi bi-check-circle me-1"></i>Confirmar
                  </button>
                  <button type="button"
                    class="btn btn-outline-danger btn-sm fw-semibold" style="border-radius:10px;font-size:12px;padding:6px 12px;"
                    (click)="cancel(apt.id)">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                  </button>
                </div>
              </div>
            </div>
            <hr class="mb-4">
          </ng-container>

          <!-- Sección: Historial de Servicios -->
          <h5 class="fw-bold mb-3" style="color:#1a1a2e;font-size:15px;">🗂 Historial de Servicios</h5>

          <!-- Tabs de filtro -->
          <div class="d-flex gap-2 mb-3">
            <button *ngFor="let tab of tabs" type="button"
              class="btn btn-sm fw-semibold"
              [class.btn-primary]="activeTab === tab.key"
              [class.btn-outline-secondary]="activeTab !== tab.key"
              style="border-radius:20px;font-size:12px;"
              (click)="activeTab = tab.key; updateFilteredHistory(user)">
              {{ tab.label }}
            </button>
          </div>

          <!-- Lista del historial (grid en escritorio) -->
          <ng-container *ngIf="filteredHistory.length; else emptyHistory">
            <div class="history-grid">
              <!-- Tarjeta de historial personalizada con botón de ficha médica -->
              <div *ngFor="let h of filteredHistory"
                class="card border-0 shadow-sm"
                style="border-radius:14px;overflow:hidden;">
                <div class="card-body p-3">
                  <div class="d-flex align-items-start gap-3">
                    <div class="d-flex align-items-center justify-content-center flex-shrink-0"
                      style="width:48px;height:48px;border-radius:12px;font-size:22px;"
                      [style.background]="h.status === 'completed' ? 'rgba(25,135,84,0.1)' : 'rgba(229,57,53,0.08)'">
                      {{ h.icon }}
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="mb-0 fw-bold" style="color:#1a1a2e;font-size:13px;">{{ h.service }}</h6>
                        <span [class]="h.status | statusBadgeClass" style="font-size:10px;">
                          {{ h.status | appointmentStatus }}
                        </span>
                      </div>
                      <p class="mb-0 small text-muted">🐾 {{ h.pet }}</p>
                      <p class="mb-0 small text-muted">📅 {{ h.date }} &nbsp;⏰ {{ h.time }}</p>
                      <p class="mb-0 small text-muted">🩺 {{ h.doctorName ?? h.vet }}</p>
                    </div>
                  </div>

                  <!-- Botón "Ver Ficha Médica" para clientes (solo si hay ficha) -->
                  <button *ngIf="h.status === 'completed' && h.medicalRecord"
                    type="button"
                    class="btn btn-outline-success btn-sm w-100 mt-3 fw-semibold"
                    style="border-radius:10px;font-size:12px;"
                    (click)="openMedicalRecord(h)">
                    <i class="bi bi-clipboard2-pulse me-1"></i>Ver Ficha Clínica
                  </button>

                  <!-- Badge si completada pero sin ficha aún -->
                  <div *ngIf="h.status === 'completed' && !h.medicalRecord"
                    class="mt-3 p-2 rounded-3 text-center" style="background:rgba(50,172,220,0.07);">
                    <p class="mb-0 small text-muted">Ficha clínica no disponible</p>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-template #emptyHistory>
            <div class="text-center py-5 text-muted">
              <div style="font-size:56px;">📭</div>
              <p class="fw-semibold">Sin registros</p>
              <p class="small">No hay servicios en esta categoría</p>
            </div>
          </ng-template>
        </div>

        <!-- CONTENIDO DOCTOR -->
        <div class="px-3 pt-3" *ngIf="user.role === 'doctor'">
          <!-- Buscador -->
          <div class="mb-4 position-relative">
            <i class="bi bi-search position-absolute" style="left:14px;top:50%;transform:translateY(-50%);color:#6c757d;z-index:1;"></i>
            <input type="text" class="form-control ps-5 border-0 shadow-sm"
              style="border-radius:12px;height:48px;background:#fff;"
              placeholder="Buscar por nombre de dueño o mascota..."
              [formControl]="doctorSearchControl">
          </div>

          <div class="row g-3">
            <!-- Columna Izquierda: Lista de Dueños y sus Mascotas -->
            <div class="col-12 col-md-5">
              <h5 class="fw-bold mb-3" style="color:#1a1a2e;font-size:15px;">Dueños y Mascotas 👥</h5>
              
              <div *ngIf="filteredOwners.length === 0" class="text-center py-4 text-muted bg-white rounded-4 shadow-sm">
                <p class="small mb-0">No se encontraron dueños o mascotas</p>
              </div>
              
              <div *ngFor="let owner of filteredOwners" class="card border-0 shadow-sm mb-3" style="border-radius:16px;">
                <div class="card-body p-3">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                      style="width:36px;height:36px;background:#198754;font-size:14px;">
                      {{ owner.name[0] }}
                    </div>
                    <div>
                      <h6 class="fw-bold mb-0" style="color:#1a1a2e;font-size:13px;">{{ owner.name }}</h6>
                      <p class="text-muted mb-0" style="font-size:11px;">{{ owner.email }}</p>
                    </div>
                  </div>
                  
                  <!-- Mascotas de este dueño -->
                  <div class="d-flex flex-wrap gap-2 mt-2">
                    <button *ngFor="let pet of owner.pets" type="button"
                      class="btn btn-sm d-flex align-items-center gap-1 py-1 px-2 border-0"
                      [class.selected-pet-btn]="selectedDoctorPet?.getId() === pet.getId()"
                      [class.unselected-pet-btn]="selectedDoctorPet?.getId() !== pet.getId()"
                      style="border-radius:12px;font-size:11px;font-weight:600;transition:all 0.2s;"
                      (click)="selectDoctorPet(pet)">
                      {{ pet.getEmoji() }} {{ pet.getName() }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Atenciones de la Mascota Seleccionada -->
            <div class="col-12 col-md-7">
              <h5 class="fw-bold mb-3" style="color:#1a1a2e;font-size:15px;">Atenciones Clínicas 🩺</h5>
              
              <div *ngIf="!selectedDoctorPet" class="card border-0 shadow-sm text-center py-5" style="border-radius:16px;background:#fff;">
                <div style="font-size:44px;">🐾</div>
                <p class="fw-semibold text-muted mt-2 mb-1" style="font-size:14px;">Selecciona una mascota</p>
                <p class="text-muted small px-3">Elige una mascota de la lista de la izquierda para ver su historial de atenciones contigo.</p>
              </div>

              <div *ngIf="selectedDoctorPet" class="card border-0 shadow-sm" style="border-radius:16px;background:#fff;">
                <!-- Detalles de Mascota Seleccionada -->
                <div class="p-3 border-bottom d-flex align-items-center gap-3" style="background:rgba(25,135,84,0.04);">
                  <div class="d-flex align-items-center justify-content-center rounded-circle"
                    style="width:48px;height:48px;background:rgba(25,135,84,0.1);font-size:24px;">
                    {{ selectedDoctorPet.getEmoji() }}
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0" style="color:#1a1a2e;font-size:14px;">
                      {{ selectedDoctorPet.getName() }}
                    </h6>
                    <p class="text-muted mb-0" style="font-size:11px;">
                      {{ selectedDoctorPet.getTypeLabel() }} · {{ selectedDoctorPet.getRaza() }} · {{ selectedDoctorPet.getAge() }}
                    </p>
                    <p class="text-muted mb-0" style="font-size:10px;">
                      Dueño: <strong>{{ selectedDoctorPet.getOwnerName() || 'Alexander' }}</strong>
                    </p>
                  </div>
                </div>

                <div class="p-3">
                  <!-- Lista de atenciones hechas por el doctor -->
                  <div *ngIf="getPetAttentions(selectedDoctorPet, user.doctorId || '').length === 0" class="text-center py-4 text-muted">
                    <p class="small mb-0">No registras atenciones previas para esta mascota.</p>
                  </div>

                  <div *ngIf="getPetAttentions(selectedDoctorPet, user.doctorId || '').length > 0" class="d-flex flex-column gap-3">
                    <div *ngFor="let apt of getPetAttentions(selectedDoctorPet, user.doctorId || '')"
                      class="p-3 rounded-3 border d-flex justify-content-between align-items-center"
                      style="background:#f8f9fa;">
                      <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                          <span style="font-size:18px;">{{ apt.icon }}</span>
                          <span class="fw-bold text-dark" style="font-size:13px;">{{ apt.service }}</span>
                        </div>
                        <div class="text-muted" style="font-size:11px;">
                          📅 {{ apt.date }} &nbsp;⏰ {{ apt.time }}
                        </div>
                        <div class="text-success small fw-semibold mt-1" *ngIf="apt.medicalRecord">
                          <i class="bi bi-check-circle-fill me-1"></i>Atendido por ti
                        </div>
                      </div>
                      
                      <!-- Botón ver ficha -->
                      <button *ngIf="apt.medicalRecord" type="button"
                        class="btn btn-sm btn-outline-success fw-semibold"
                        style="border-radius:8px;font-size:11px;"
                        (click)="openMedicalRecord(apt)">
                        <i class="bi bi-clipboard2-pulse me-1"></i>Ver Ficha
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal: Ficha Clínica -->
        <app-modal *ngIf="selectedRecord && selectedAppointment"
          [title]="'📋 Ficha Clínica — ' + selectedAppointment.service"
          (closed)="closeMedicalRecord()">

          <!-- Info de la cita -->
          <div class="p-3 rounded-3 mb-4" style="background:linear-gradient(135deg,rgba(25,135,84,0.06),rgba(13,110,253,0.06));border:1px solid rgba(25,135,84,0.15);">
            <div class="d-flex align-items-center gap-3 mb-2">
              <div style="font-size:32px;">{{ selectedAppointment.icon }}</div>
              <div>
                <p class="fw-bold mb-0" style="color:#1a1a2e;font-size:15px;">{{ selectedAppointment.service }}</p>
                <p class="text-muted small mb-0">🐾 {{ selectedAppointment.pet }} &nbsp;·&nbsp; 📅 {{ selectedAppointment.date }}</p>
              </div>
            </div>
            <p class="small mb-0" style="color:#198754;font-weight:600;">
              🩺 Atendido por: {{ selectedAppointment.doctorName ?? selectedAppointment.vet }}
            </p>
            <p class="small text-muted mb-0">⏱ {{ selectedRecord.attendedAt }}</p>
          </div>

          <!-- Campos de la ficha -->
          <div class="medical-fields">
            <div class="medical-field">
              <div class="medical-field-icon" style="background:rgba(13,110,253,0.1);">🏥</div>
              <div>
                <p class="medical-field-label">Tratamiento realizado</p>
                <p class="medical-field-value">{{ selectedRecord.treatment }}</p>
              </div>
            </div>

            <div class="medical-field">
              <div class="medical-field-icon" style="background:rgba(242,148,85,0.1);">💊</div>
              <div>
                <p class="medical-field-label">Medicamentos / Insumos</p>
                <p class="medical-field-value">{{ selectedRecord.medications }}</p>
              </div>
            </div>

            <div class="medical-field">
              <div class="medical-field-icon" style="background:rgba(229,57,53,0.08);">⚠️</div>
              <div>
                <p class="medical-field-label">Reacciones observadas</p>
                <p class="medical-field-value">{{ selectedRecord.reactions || 'Sin reacciones adversas' }}</p>
              </div>
            </div>

            <div class="medical-field">
              <div class="medical-field-icon" style="background:rgba(25,135,84,0.1);">📝</div>
              <div>
                <p class="medical-field-label">Recomendaciones</p>
                <p class="medical-field-value">{{ selectedRecord.recommendations }}</p>
              </div>
            </div>
          </div>
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
    .history-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    @media (min-width: 768px) {
      .history-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1200px) {
      .history-grid { grid-template-columns: repeat(3, 1fr); }
    }
    .medical-fields { display: flex; flex-direction: column; gap: 12px; }
    .medical-field {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 12px;
    }
    .medical-field-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .medical-field-label {
      font-size: 10px;
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 3px;
    }
    .medical-field-value {
      font-size: 13px;
      color: #1a1a2e;
      font-weight: 500;
      margin: 0;
      line-height: 1.5;
    }
    .selected-pet-btn {
      background: #198754;
      color: #fff !important;
      box-shadow: 0 4px 10px rgba(25,135,84,0.3);
    }
    .unselected-pet-btn {
      background: rgba(25,135,84,0.08);
      color: #198754 !important;
    }
    .unselected-pet-btn:hover {
      background: rgba(25,135,84,0.15);
    }
  `],
})
export class HistoryComponent implements OnInit {
  user$: Observable<User | null>;
  appointments$: Observable<Appointment[]>;
  filteredHistory: Appointment[] = [];
  activeTab: HistoryTab = 'todos';
  selectedRecord: MedicalRecord | null = null;
  selectedAppointment: Appointment | null = null;

  // Propiedades para el Doctor
  doctorSearchControl = new FormControl('');
  selectedDoctorPet: Pet | null = null;

  readonly tabs = [
    { key: 'todos'     as HistoryTab, label: 'Todos'       },
    { key: 'completed' as HistoryTab, label: 'Completados' },
    { key: 'cancelled' as HistoryTab, label: 'Cancelados'  },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly appointmentService: AppointmentService,
    private readonly petService: PetService,
  ) {
    this.user$ = this.authService.currentUser$;
    this.appointments$ = this.appointmentService.appointments$;
  }

  ngOnInit(): void {
    this.user$.subscribe(user => this.updateFilteredHistory(user));
    this.appointmentService.history$.subscribe(() => {
      this.user$.subscribe(user => this.updateFilteredHistory(user)).unsubscribe();
    });
  }

  get owners(): { name: string; email: string; pets: Pet[] }[] {
    const pets = this.petService.pets;
    const groupsMap = new Map<string, { name: string; email: string; pets: Pet[] }>();
    
    pets.forEach(pet => {
      const email = pet.getOwnerEmail() || 'alexander@pettime.com';
      const name = pet.getOwnerName() || 'Alexander';
      
      if (!groupsMap.has(email)) {
        groupsMap.set(email, { name, email, pets: [] });
      }
      groupsMap.get(email)!.pets.push(pet);
    });
    
    return Array.from(groupsMap.values());
  }

  get filteredOwners(): { name: string; email: string; pets: Pet[] }[] {
    const query = this.doctorSearchControl.value?.toLowerCase()?.trim() || '';
    const allOwners = this.owners;
    if (!query) return allOwners;
    
    return allOwners.map(owner => {
      const matchesOwner = owner.name.toLowerCase().includes(query);
      const matchingPets = owner.pets.filter(pet => 
        pet.getName().toLowerCase().includes(query) || 
        String(pet.getId()).includes(query)
      );
      
      if (matchesOwner || matchingPets.length > 0) {
        return {
          ...owner,
          pets: matchesOwner ? owner.pets : matchingPets
        };
      }
      return null;
    }).filter((o): o is { name: string; email: string; pets: Pet[] } => o !== null);
  }

  selectDoctorPet(pet: Pet): void {
    this.selectedDoctorPet = pet;
  }

  getPetAttentions(pet: Pet, doctorId: string): Appointment[] {
    const history = this.appointmentService.history;
    return history.filter(h => 
      h.status === 'completed' &&
      h.doctorId === doctorId &&
      (h.petId === pet.getId() || (h.pet.toLowerCase() === pet.getName().toLowerCase() && h.ownerEmail === pet.getOwnerEmail()))
    );
  }

  updateFilteredHistory(user: User | null): void {
    const isDoctor = user?.role === 'doctor';
    const doctorId = user?.doctorId;
    let history = this.appointmentService.history;

    // Filtrar por doctor si corresponde
    if (isDoctor && doctorId) {
      history = history.filter(h => h.doctorId === doctorId);
    }

    this.filteredHistory = this.activeTab === 'todos'
      ? history
      : history.filter(h => h.status === this.activeTab);
  }

  openMedicalRecord(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.selectedRecord = apt.medicalRecord ?? null;
  }

  closeMedicalRecord(): void {
    this.selectedAppointment = null;
    this.selectedRecord = null;
  }

  confirm(id: number): void { this.appointmentService.confirmAppointment(id); }
  cancel(id: number): void {
    this.appointmentService.cancelAppointment(id);
    const user = this.authService.currentUser;
    this.updateFilteredHistory(user);
  }
}
