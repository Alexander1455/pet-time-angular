// ============================================================
// history.component.ts — Historial y gestión de citas
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AppointmentService } from '../../core/services/appointment.service';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { AppointmentStatusPipe, StatusBadgeClassPipe } from '../../shared/pipes/appointment-status.pipe';
import { HighlightAppointmentDirective } from '../../shared/directives/highlight-appointment.directive';
import { Appointment } from '../../models/appointment.model';

type HistoryTab = 'todos' | 'completed' | 'cancelled';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ServiceCardComponent,
    BottomNavComponent,
    AppointmentStatusPipe,
    StatusBadgeClassPipe,
    HighlightAppointmentDirective,
  ],
  template: `
    <div class="app-shell" style="max-width:430px;margin:0 auto;min-height:100vh;background:#f8f9fa;padding-bottom:80px;">

      <!-- Header -->
      <div class="p-4 bg-white border-bottom">
        <h1 class="fw-bold mb-1" style="color:#1a1a2e;font-size:22px;">Historial 📋</h1>
        <p class="text-muted small mb-0">Gestiona tus citas y revisa tu historial</p>
      </div>

      <div class="px-3 pt-3">

        <!-- Sección 1: Citas Pendientes / Confirmadas -->
        <ng-container *ngIf="(appointments$ | async)?.length">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0" style="color:#1a1a2e;font-size:15px;">📅 Citas Pendientes</h5>
            <span class="badge bg-warning text-dark">
              {{ (appointments$ | async)?.length }} cita(s)
            </span>
          </div>

          <!-- Tarjetas de citas activas con directiva de resaltado -->
          <div
            *ngFor="let apt of (appointments$ | async)"
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
                  <p class="mb-0 small text-muted">📍 {{ apt.vet }}</p>
                  <p *ngIf="apt.address" class="mb-0 fw-medium" style="font-size:11px;color:#32ACDC;">🗺 {{ apt.address }}</p>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="d-flex gap-2 mt-3">
                <button *ngIf="apt.status === 'pending'" type="button"
                  class="btn btn-outline-primary btn-sm flex-fill fw-semibold" style="border-radius:10px;font-size:12px;"
                  (click)="confirm(apt.id)">
                  <i class="bi bi-check-circle me-1"></i>Confirmar
                </button>
                <button *ngIf="apt.status === 'confirmed'" type="button"
                  class="btn btn-outline-success btn-sm flex-fill fw-semibold" style="border-radius:10px;font-size:12px;"
                  (click)="complete(apt.id)">
                  <i class="bi bi-check-circle-fill me-1"></i>Completada
                </button>
                <button type="button"
                  class="btn btn-outline-danger btn-sm fw-semibold" style="border-radius:10px;font-size:12px;padding:6px 12px;"
                  (click)="cancel(apt.id)">
                  <i class="bi bi-x-circle me-1"></i>Cancelar
                </button>
              </div>
            </div>
          </div>

          <p class="text-muted small mb-4 px-1">
            💡 Puedes <strong>Confirmar</strong> la cita cuando estés listo, o marcarla como <strong>Completada</strong> después de asistir.
          </p>
          <hr class="mb-4">
        </ng-container>

        <!-- Sección 2: Historial de Servicios -->
        <h5 class="fw-bold mb-3" style="color:#1a1a2e;font-size:15px;">🗂 Historial de Servicios</h5>

        <!-- Tabs de filtro -->
        <div class="d-flex gap-2 mb-3">
          <button *ngFor="let tab of tabs" type="button"
            class="btn btn-sm fw-semibold"
            [class.btn-primary]="activeTab === tab.key"
            [class.btn-outline-secondary]="activeTab !== tab.key"
            style="border-radius:20px;font-size:12px;"
            (click)="activeTab = tab.key; updateFilteredHistory()">
            {{ tab.label }}
          </button>
        </div>

        <!-- Lista del historial -->
        <ng-container *ngIf="filteredHistory.length; else emptyHistory">
          <app-service-card
            *ngFor="let h of filteredHistory"
            [appointment]="h">
          </app-service-card>
        </ng-container>

        <ng-template #emptyHistory>
          <div class="text-center py-5 text-muted">
            <div style="font-size:56px;">📭</div>
            <p class="fw-semibold">Sin registros</p>
            <p class="small">No hay servicios en esta categoría</p>
          </div>
        </ng-template>

      </div>

      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  appointments$: Observable<Appointment[]>;
  filteredHistory: Appointment[] = [];
  activeTab: HistoryTab = 'todos';

  readonly tabs = [
    { key: 'todos'     as HistoryTab, label: 'Todos'       },
    { key: 'completed' as HistoryTab, label: 'Completados' },
    { key: 'cancelled' as HistoryTab, label: 'Cancelados'  },
  ];

  constructor(private readonly appointmentService: AppointmentService) {
    this.appointments$ = this.appointmentService.appointments$;
  }

  ngOnInit(): void {
    this.appointmentService.history$.subscribe(() => this.updateFilteredHistory());
  }

  updateFilteredHistory(): void {
    const history = this.appointmentService.history;
    this.filteredHistory = this.activeTab === 'todos'
      ? history
      : history.filter(h => h.status === this.activeTab);
  }

  confirm(id: number):  void { this.appointmentService.confirmAppointment(id); }
  complete(id: number): void { this.appointmentService.completeAppointment(id); }
  cancel(id: number):   void { this.appointmentService.cancelAppointment(id); this.updateFilteredHistory(); }
}
