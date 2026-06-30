// ============================================================
// login.component.ts
// Componente de inicio de sesión con Reactive Forms.
// ============================================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputFieldComponent],
  template: `
    <div class="auth-container d-flex flex-column align-items-center justify-content-center min-vh-100 px-4"
         style="background: linear-gradient(160deg, #f0f9ff 0%, #fff 60%); max-width:430px; margin:0 auto;">

      <!-- Logo -->
      <img src="/Logo-PetTime.svg" alt="PetTime" class="mb-2 animate-fadeIn" style="height:70px;" onerror="this.style.display='none'">

      <!-- Encabezado -->
      <div class="text-center mb-4 animate-fadeIn">
        <h1 class="fw-bold mb-1" style="color:#F29455; font-size:28px;">Iniciar Sesión</h1>
        <p class="text-muted small">Bienvenido de vuelta 🐾</p>
      </div>

      <!-- Tarjeta del formulario -->
      <div class="card shadow-sm border-0 w-100" style="border-radius:20px;">
        <div class="card-body p-4">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

            <!-- Campo Email -->
            <app-input-field
              label="Correo electrónico"
              type="email"
              icon="bi-envelope"
              placeholder="correo@ejemplo.com"
              [control]="loginForm.get('email')">
            </app-input-field>

            <!-- Campo Contraseña -->
            <app-input-field
              label="Contraseña"
              type="password"
              icon="bi-lock"
              placeholder="Tu contraseña"
              [control]="loginForm.get('password')">
            </app-input-field>

            <!-- Error general -->
            <div *ngIf="errorMsg" class="alert alert-danger py-2 small" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ errorMsg }}
            </div>

            <!-- Botón de envío -->
            <button
              type="submit"
              class="btn w-100 fw-bold py-3 mt-2"
              style="background: linear-gradient(135deg,#32ACDC,#1a8ab5); color:#fff; border-radius:12px; border:none; font-size:15px;"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Link a registro -->
      <p class="mt-4 text-muted small animate-fadeIn">
        ¿No tienes cuenta?
        <a routerLink="/auth/register" class="fw-bold text-decoration-none" style="color:#F29455;">Regístrate</a>
      </p>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(-10px);} to { opacity:1; transform:none;} }
    .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
  `],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, ir directo al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/app/dashboard']);
      return;
    }

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      await this.authService.login(this.loginForm.value);
      this.router.navigate(['/app/dashboard']);
    } catch {
      this.errorMsg = 'Error al iniciar sesión. Verifica tus credenciales.';
    } finally {
      this.loading = false;
    }
  }
}
