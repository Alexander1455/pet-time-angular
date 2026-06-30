// ============================================================
// step-three.component.ts — Paso 3: Datos de la mascota
// ============================================================
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';

interface PetTypeOption { label: string; emoji: string; value: string; }

@Component({
  selector: 'app-step-three',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  template: `
    <div class="w-100 card border-0 shadow-sm p-4" style="border-radius:20px;">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <!-- Nombre de la mascota -->
        <app-input-field label="Nombre de la mascota" type="text" icon="bi-heart"
          placeholder="¿Cómo se llama?" [control]="form.get('petName')">
        </app-input-field>

        <!-- Tipo de mascota -->
        <div class="mb-3">
          <label class="form-label fw-semibold text-secondary small">Tipo de mascota</label>
          <div class="d-flex gap-2">
            <button type="button"
              *ngFor="let pt of petTypes"
              class="btn flex-fill flex-column py-2 gap-1"
              [class.btn-primary]="form.get('petType')?.value === pt.value"
              [class.btn-outline-secondary]="form.get('petType')?.value !== pt.value"
              style="border-radius:12px;"
              (click)="form.get('petType')?.setValue(pt.value)">
              <span style="font-size:24px;">{{ pt.emoji }}</span>
              <span style="font-size:12px;">{{ pt.label }}</span>
            </button>
          </div>
          <div *ngIf="form.get('petType')?.invalid && form.get('petType')?.touched"
            class="text-danger small mt-1">
            <i class="bi bi-exclamation-circle-fill"></i> Selecciona el tipo
          </div>
        </div>

        <!-- Sexo -->
        <div class="mb-3">
          <label class="form-label fw-semibold text-secondary small">Sexo</label>
          <div class="d-flex gap-2">
            <button type="button"
              *ngFor="let s of ['Macho','Hembra']"
              class="btn flex-fill py-2"
              [class.btn-primary]="form.get('sexo')?.value === s"
              [class.btn-outline-secondary]="form.get('sexo')?.value !== s"
              style="border-radius:10px;"
              (click)="form.get('sexo')?.setValue(s)">
              {{ s === 'Macho' ? '♂️' : '♀️' }} {{ s }}
            </button>
          </div>
          <div *ngIf="form.get('sexo')?.invalid && form.get('sexo')?.touched"
            class="text-danger small mt-1">
            <i class="bi bi-exclamation-circle-fill"></i> Selecciona el sexo
          </div>
        </div>

        <!-- Raza -->
        <app-input-field label="Raza" type="text" icon="bi-tag"
          placeholder="Ej: Labrador, Persa..." [control]="form.get('raza')">
        </app-input-field>

        <!-- Fecha de nacimiento -->
        <div class="mb-3">
          <label class="form-label fw-semibold text-secondary small">Fecha de nacimiento</label>
          <input type="date" class="form-control" formControlName="fechaNac" [max]="today"
            [class.is-invalid]="form.get('fechaNac')?.invalid && form.get('fechaNac')?.touched">
          <div class="invalid-feedback">La fecha de nacimiento es requerida</div>
        </div>

        <!-- Navegación -->
        <div class="d-flex gap-2 mt-3">
          <button type="button" class="btn btn-outline-secondary py-3 px-4" style="border-radius:12px;"
            (click)="back.emit()">
            <i class="bi bi-arrow-left"></i>
          </button>
          <button type="submit" class="btn flex-fill fw-bold py-3"
            style="background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;border-radius:12px;border:none;"
            [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Registrando...' : 'Registrar 🐾' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class StepThreeComponent implements OnInit {
  @Input() loading = false;
  @Output() submit = new EventEmitter<any>();
  @Output() back   = new EventEmitter<void>();

  form!: FormGroup;
  today = new Date().toISOString().split('T')[0];

  readonly petTypes: PetTypeOption[] = [
    { label: 'Perro', emoji: '🐶', value: 'perro' },
    { label: 'Gato',  emoji: '🐱', value: 'gato'  },
    { label: 'Otro',  emoji: '🐰', value: 'otro'  },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      petName:  ['', [Validators.required, Validators.minLength(2)]],
      petType:  ['', Validators.required],
      sexo:     ['', Validators.required],
      raza:     ['', [Validators.required, Validators.minLength(2)]],
      fechaNac: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submit.emit(this.form.value);
  }
}
