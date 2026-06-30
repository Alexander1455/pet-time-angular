// ============================================================
// profile.component.ts — Perfil de usuario
// ============================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { PetService } from '../../core/services/pet.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { InputFieldComponent } from '../../shared/components/input-field/input-field.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { User } from '../../models/user.model';

function passwordMatchValidator(c: AbstractControl): ValidationErrors | null {
  const next = c.get('next'); const confirm = c.get('confirm');
  if (next && confirm && next.value !== confirm.value) { confirm.setErrors({ mismatch: true }); return { mismatch: true }; }
  return null;
}

type ModalType = 'edit' | 'password' | 'logout' | null;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputFieldComponent, ModalComponent, BottomNavComponent],
  template: `
    <div class="app-shell" style="max-width:430px;margin:0 auto;min-height:100vh;background:#f8f9fa;padding-bottom:80px;">

      <!-- Avatar y estadísticas -->
      <div class="bg-white text-center py-5 px-4 border-bottom">
        <div class="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle fw-bold"
          style="width:88px;height:88px;background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;font-size:36px;box-shadow:0 6px 20px rgba(50,172,220,0.4);">
          {{ (user$ | async)?.avatar }}
        </div>
        <h2 class="fw-bold mb-1" style="color:#1a1a2e;font-size:20px;">{{ (user$ | async)?.name }}</h2>
        <p class="text-muted small mb-4">{{ (user$ | async)?.email }}</p>

        <!-- Estadísticas -->
        <div class="d-flex justify-content-center gap-5 px-3 py-3 rounded-3" style="background:rgba(50,172,220,0.06);">
          <div class="text-center">
            <p class="fw-bold mb-0" style="color:#32ACDC;font-size:22px;">{{ (stats$ | async)?.appointments }}</p>
            <p class="text-muted mb-0" style="font-size:11px;font-weight:500;">Citas</p>
          </div>
          <div class="text-center">
            <p class="fw-bold mb-0" style="color:#32ACDC;font-size:22px;">{{ (stats$ | async)?.completed }}</p>
            <p class="text-muted mb-0" style="font-size:11px;font-weight:500;">Completados</p>
          </div>
          <div class="text-center">
            <p class="fw-bold mb-0" style="color:#32ACDC;font-size:22px;">{{ (stats$ | async)?.pets }}</p>
            <p class="text-muted mb-0" style="font-size:11px;font-weight:500;">Mascotas</p>
          </div>
        </div>
      </div>

      <!-- Opciones de cuenta -->
      <div class="px-3 pt-4">
        <p class="text-muted fw-semibold mb-3" style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Cuenta</p>

        <button *ngFor="let opt of accountOptions" type="button"
          class="btn w-100 text-start d-flex align-items-center gap-3 mb-2 p-3 bg-white shadow-sm"
          style="border-radius:14px;border:none;transition:transform 0.15s,box-shadow 0.15s;"
          (click)="activeModal = opt.modal"
          (mouseenter)="onOptionHover($event, true)"
          (mouseleave)="onOptionHover($event, false)">
          <div class="d-flex align-items-center justify-content-center rounded-3"
            style="width:44px;height:44px;background:rgba(50,172,220,0.10);">
            <i [class]="'bi ' + opt.icon" style="color:#32ACDC;font-size:20px;"></i>
          </div>
          <div class="flex-grow-1">
            <p class="fw-semibold mb-0" style="font-size:14px;color:#1a1a2e;">{{ opt.label }}</p>
            <p class="text-muted mb-0" style="font-size:12px;">{{ opt.sublabel }}</p>
          </div>
          <i class="bi bi-chevron-right text-muted"></i>
        </button>

        <p class="text-muted fw-semibold mb-3 mt-4" style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Sesión</p>

        <button type="button"
          class="btn w-100 text-start d-flex align-items-center gap-3 mb-2 p-3 bg-white shadow-sm"
          style="border-radius:14px;border:none;"
          (click)="activeModal = 'logout'">
          <div class="d-flex align-items-center justify-content-center rounded-3"
            style="width:44px;height:44px;background:rgba(229,57,53,0.10);">
            <i class="bi bi-box-arrow-right" style="color:#e53935;font-size:20px;"></i>
          </div>
          <div class="flex-grow-1">
            <p class="fw-semibold mb-0" style="font-size:14px;color:#e53935;">Cerrar Sesión</p>
            <p class="text-muted mb-0" style="font-size:12px;">Salir de tu cuenta</p>
          </div>
          <i class="bi bi-chevron-right text-muted"></i>
        </button>
      </div>

      <!-- Modal: Editar Perfil -->
      <app-modal *ngIf="activeModal === 'edit'" title="✏️ Editar Perfil" (closed)="closeModal()">
        <form [formGroup]="editForm" (ngSubmit)="onSaveProfile()">
          <app-input-field label="Nombre completo" type="text" icon="bi-person"
            placeholder="Tu nombre" [control]="editForm.get('name')">
          </app-input-field>
          <app-input-field label="Correo electrónico" type="email" icon="bi-envelope"
            placeholder="correo@ejemplo.com" [control]="editForm.get('email')">
          </app-input-field>
          <button type="submit" class="btn w-100 fw-bold py-3"
            style="background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;border-radius:12px;border:none;"
            [disabled]="editLoading">
            <span *ngIf="editLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!editLoading" class="bi bi-save me-2"></i>
            {{ editLoading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </form>
      </app-modal>

      <!-- Modal: Cambiar Contraseña -->
      <app-modal *ngIf="activeModal === 'password'" title="🔒 Cambiar Contraseña" (closed)="closeModal()">
        <div *ngIf="passwordSuccess" class="text-center py-4">
          <div style="font-size:52px;">✅</div>
          <p class="fw-semibold mt-2" style="color:#198754;font-size:16px;">¡Contraseña actualizada!</p>
        </div>
        <form *ngIf="!passwordSuccess" [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
          <app-input-field label="Contraseña actual" type="password" icon="bi-lock"
            placeholder="Tu contraseña actual" [control]="passwordForm.get('current')">
          </app-input-field>
          <app-input-field label="Nueva contraseña" type="password" icon="bi-lock-fill"
            placeholder="Mínimo 6 caracteres" [control]="passwordForm.get('next')">
          </app-input-field>
          <app-input-field label="Confirmar nueva contraseña" type="password" icon="bi-shield-lock"
            placeholder="Repite la nueva contraseña" [control]="passwordForm.get('confirm')">
          </app-input-field>
          <button type="submit" class="btn w-100 fw-bold py-3"
            style="background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;border-radius:12px;border:none;"
            [disabled]="passLoading">
            <span *ngIf="passLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ passLoading ? 'Actualizando...' : 'Actualizar contraseña' }}
          </button>
        </form>
      </app-modal>

      <!-- Modal: Confirmación Logout -->
      <div *ngIf="activeModal === 'logout'"
        class="position-fixed inset-0 d-flex align-items-center justify-content-center"
        style="inset:0;background:rgba(0,0,0,0.45);z-index:1050;padding:24px;">
        <div class="bg-white rounded-4 p-4 text-center" style="max-width:300px;width:100%;animation:scaleIn 0.25s ease;">
          <div style="font-size:48px;">👋</div>
          <h5 class="fw-bold mt-2 mb-1" style="color:#1a1a2e;">¿Cerrar sesión?</h5>
          <p class="text-muted small mb-4">Se cerrará tu sesión actual</p>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary flex-fill" style="border-radius:10px;" (click)="activeModal=null">Cancelar</button>
            <button class="btn btn-danger flex-fill fw-bold" style="border-radius:10px;" (click)="onLogout()">Cerrar sesión</button>
          </div>
        </div>
      </div>

      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
  styles: [`
    @keyframes scaleIn { from { transform:scale(0.8);opacity:0; } to { transform:scale(1);opacity:1; } }
  `],
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  stats$: Observable<{ appointments: number; completed: number; pets: number }>;

  activeModal: ModalType = null;
  editForm!: FormGroup;
  passwordForm!: FormGroup;
  editLoading = false;
  passLoading = false;
  passwordSuccess = false;

  readonly accountOptions = [
    { modal: 'edit'     as ModalType, icon: 'bi-pencil-square',  label: 'Editar Perfil',      sublabel: 'Actualiza tu nombre y correo'      },
    { modal: 'password' as ModalType, icon: 'bi-lock',           label: 'Cambiar Contraseña', sublabel: 'Modifica tu contraseña de acceso'  },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly petService: PetService,
    private readonly appointmentService: AppointmentService,
    private readonly router: Router,
  ) {
    this.user$ = this.authService.currentUser$;

    this.stats$ = combineLatest([
      this.appointmentService.appointments$,
      this.appointmentService.history$,
      this.petService.pets$,
    ]).pipe(map(([apts, history, pets]) => ({
      appointments: apts.length,
      completed: history.filter(h => h.status === 'completed').length,
      pets: pets.length,
    })));
  }

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.editForm = this.fb.group({
      name:  [user?.name  ?? '', [Validators.required, Validators.minLength(2)]],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
    });
    this.passwordForm = this.fb.group({
      current: ['', Validators.required],
      next:    ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  async onSaveProfile(): Promise<void> {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    this.editLoading = true;
    await new Promise(r => setTimeout(r, 700));
    this.authService.updateUser(this.editForm.value);
    this.editLoading = false;
    this.closeModal();
  }

  async onChangePassword(): Promise<void> {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.passLoading = true;
    await new Promise(r => setTimeout(r, 800));
    this.passLoading = false;
    this.passwordSuccess = true;
    setTimeout(() => this.closeModal(), 1500);
  }

  onLogout(): void {
    this.authService.logout();
    this.appointmentService.reset();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  onOptionHover(event: MouseEvent, isEnter: boolean): void {
    const el = event.currentTarget as HTMLElement;
    el.style.transform = isEnter ? 'translateX(4px)' : 'translateX(0)';
  }

  closeModal(): void {
    this.activeModal = null;
    this.passwordSuccess = false;
    this.editLoading = false;
    this.passLoading = false;
  }
}
