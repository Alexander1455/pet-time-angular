// ============================================================
// demo-switcher.component.ts
// Widget flotante para cambiar de rol durante la demostración.
// Permite alternar entre vista de Cliente y vista de Doctor
// con un solo clic sin necesidad de desloguearse.
// ============================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../models/doctor.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-demo-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="user$ | async as user" class="demo-switcher-wrap">

      <!-- Botón principal (toggle) -->
      <button class="demo-toggle" (click)="expanded = !expanded"
        [title]="expanded ? 'Cerrar menú de demo' : 'Cambiar rol (Demo)'">
        <span style="font-size:16px;">🎭</span>
        <span class="demo-toggle-label">Demo</span>
        <i class="bi" [class.bi-chevron-up]="expanded" [class.bi-chevron-down]="!expanded"></i>
      </button>

      <!-- Panel expandido -->
      <div class="demo-panel" *ngIf="expanded">
        <p class="demo-panel-title">Cambiar vista de demostración</p>

        <!-- Botón Cliente -->
        <button class="demo-role-btn"
          [class.active]="user.role === 'client'"
          (click)="switchToClient()">
          <span style="font-size:20px;">🐾</span>
          <div class="demo-role-info">
            <span class="demo-role-name">Vista Cliente</span>
            <span class="demo-role-sub">Alexander (dueño)</span>
          </div>
          <i class="bi bi-check-circle-fill" *ngIf="user.role === 'client'" style="color:#32ACDC;"></i>
        </button>

        <!-- Botones de doctores -->
        <button *ngFor="let doc of doctors" class="demo-role-btn"
          [class.active]="user.doctorId === doc.id"
          (click)="switchToDoctor(doc)">
          <span style="font-size:20px;">🩺</span>
          <div class="demo-role-info">
            <span class="demo-role-name">{{ doc.name }}</span>
            <span class="demo-role-sub">{{ doc.specialty }}</span>
          </div>
          <i class="bi bi-check-circle-fill" *ngIf="user.doctorId === doc.id" style="color:#198754;"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .demo-switcher-wrap {
      position: fixed;
      bottom: 90px;
      right: 16px;
      z-index: 500;
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-end;
      gap: 8px;
    }

    @media (min-width: 768px) {
      .demo-switcher-wrap {
        bottom: 24px;
        right: 24px;
      }
    }

    .demo-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #1a2a3a, #0d1b2a);
      color: #fff;
      border: none;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.35);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .demo-toggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    .demo-toggle-label {
      font-size: 12px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .demo-panel {
      background: rgba(13,27,42,0.97);
      backdrop-filter: blur(16px);
      border-radius: 16px;
      padding: 16px;
      min-width: 230px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.07);
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from { opacity:0; transform:translateY(8px); }
      to { opacity:1; transform:none; }
    }

    .demo-panel-title {
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      margin: 0 0 10px;
    }

    .demo-role-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px;
      margin-bottom: 6px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      text-align: left;
    }

    .demo-role-btn:last-child {
      margin-bottom: 0;
    }

    .demo-role-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .demo-role-btn.active {
      background: rgba(50,172,220,0.12);
      border-color: rgba(50,172,220,0.3);
    }

    .demo-role-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .demo-role-name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }

    .demo-role-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
    }
  `],
})
export class DemoSwitcherComponent {
  user$: Observable<User | null>;
  doctors: Doctor[];
  expanded = false;

  constructor(
    private authService: AuthService,
    private doctorService: DoctorService,
    private router: Router,
  ) {
    this.user$ = this.authService.currentUser$;
    // Mostrar solo los primeros 3 doctores para no hacer el panel demasiado largo
    this.doctors = this.doctorService.doctors.slice(0, 3);
  }

  switchToClient(): void {
    this.authService.switchDemoRole('client');
    this.expanded = false;
    this.router.navigate(['/app/dashboard']);
  }

  switchToDoctor(doc: Doctor): void {
    // Cambiar a la sesión del doctor específico usando updateUser
    this.authService.updateUser({
      name: doc.name,
      email: doc.email,
      avatar: doc.name[0].toUpperCase(),
      role: 'doctor',
      specialty: doc.specialty,
      doctorId: doc.id,
    });
    this.expanded = false;
    this.router.navigate(['/app/dashboard']);
  }
}
