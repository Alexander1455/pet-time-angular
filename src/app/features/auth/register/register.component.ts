// ============================================================
// register.component.ts
// Componente orquestador del wizard de registro (3 pasos).
// Coordina los pasos y acumula datos para el registro final.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PetService } from '../../../core/services/pet.service';
import { RegisterData } from '../../../models/user.model';
import { PetGender, PetType } from '../../../models/pet.model';
import { StepOneComponent } from './step-one/step-one.component';
import { StepTwoComponent } from './step-two/step-two.component';
import { StepThreeComponent } from './step-three/step-three.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, StepOneComponent, StepTwoComponent, StepThreeComponent],
  template: `
    <div class="auth-container d-flex flex-column align-items-center justify-content-start min-vh-100 px-4 py-4"
         style="background: linear-gradient(160deg,#f0f9ff 0%,#fff 60%); max-width:430px; margin:0 auto;">

      <!-- Logo -->
      <img src="/Logo-PetTime.svg" alt="PetTime" class="mb-3" style="height:55px;" onerror="this.style.display='none'">

      <!-- Título del paso -->
      <div class="text-center mb-3 w-100">
        <h2 class="fw-bold mb-1" style="color:#1a1a2e; font-size:22px;">{{ stepTitles[currentStep - 1] }}</h2>
        <p class="text-muted small">Paso {{ currentStep }} de 3</p>
      </div>

      <!-- Indicador de pasos -->
      <div class="d-flex align-items-center gap-2 mb-4 w-100 justify-content-center">
        <ng-container *ngFor="let s of [1,2,3]; let i = index">
          <!-- Círculo del paso -->
          <div
            class="step-circle d-flex align-items-center justify-content-center fw-bold"
            [class.active]="currentStep === s"
            [class.completed]="currentStep > s">
            {{ currentStep > s ? '✓' : s }}
          </div>
          <!-- Línea conectora -->
          <div *ngIf="i < 2" class="step-line" [class.completed]="currentStep > s"></div>
        </ng-container>
      </div>

      <!-- Paso 1: Email y contraseña -->
      <app-step-one
        *ngIf="currentStep === 1"
        (next)="onStepOneNext($event)">
      </app-step-one>

      <!-- Paso 2: Datos del dueño -->
      <app-step-two
        *ngIf="currentStep === 2"
        (next)="onStepTwoNext($event)"
        (back)="onBack()">
      </app-step-two>

      <!-- Paso 3: Datos de la mascota -->
      <app-step-three
        *ngIf="currentStep === 3"
        [loading]="loading"
        (submit)="onStepThreeSubmit($event)"
        (back)="onBack()">
      </app-step-three>

      <!-- Link a login -->
      <p class="mt-4 text-muted small">
        ¿Ya tienes cuenta?
        <a routerLink="/auth/login" class="fw-bold text-decoration-none" style="color:#F29455;">Inicia sesión</a>
      </p>
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
  currentStep = 1;
  loading = false;
  formData: Partial<RegisterData> = {};

  readonly stepTitles = ['Datos de acceso', 'Datos del dueño', 'Tu mascota'];

  constructor(
    private readonly authService: AuthService,
    private readonly petService: PetService,
    private readonly router: Router,
  ) {}

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
      // Agrega la primera mascota registrada
      this.petService.addPet({
        name: finalData.petName,
        type: finalData.petType as PetType,
        raza: finalData.raza,
        sexo: finalData.sexo as PetGender,
        fechaNac: finalData.fechaNac,
      });
      this.router.navigate(['/app/dashboard']);
    } finally {
      this.loading = false;
    }
  }

  onBack(): void {
    if (this.currentStep > 1) this.currentStep--;
  }
}
