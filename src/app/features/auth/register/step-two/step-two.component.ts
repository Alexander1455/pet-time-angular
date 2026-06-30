// ============================================================
// step-two.component.ts — Paso 2: Datos del dueño
// ============================================================
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';

@Component({
  selector: 'app-step-two',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  template: `
    <div class="w-100 card border-0 shadow-sm p-4" style="border-radius:20px;">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <app-input-field label="Nombres" type="text" icon="bi-person"
          placeholder="Tus nombres" [control]="form.get('nombres')">
        </app-input-field>

        <app-input-field label="Apellidos" type="text" icon="bi-person-fill"
          placeholder="Tus apellidos" [control]="form.get('apellidos')">
        </app-input-field>

        <app-input-field label="DNI" type="text" icon="bi-credit-card"
          placeholder="8 dígitos" [control]="form.get('dni')">
        </app-input-field>

        <app-input-field label="Teléfono" type="tel" icon="bi-telephone"
          placeholder="9 dígitos" [control]="form.get('telefono')">
        </app-input-field>

        <!-- Selección de género -->
        <div class="mb-3">
          <label class="form-label fw-semibold text-secondary small">Género</label>
          <div class="d-flex gap-2">
            <button type="button"
              *ngFor="let g of ['Masculino','Femenino']"
              class="btn flex-fill py-2"
              [class.btn-primary]="form.get('genero')?.value === g"
              [class.btn-outline-secondary]="form.get('genero')?.value !== g"
              style="border-radius:10px;"
              (click)="form.get('genero')?.setValue(g)">
              {{ g === 'Masculino' ? '👨' : '👩' }} {{ g }}
            </button>
          </div>
          <div *ngIf="form.get('genero')?.invalid && form.get('genero')?.touched"
            class="text-danger small mt-1">
            <i class="bi bi-exclamation-circle-fill"></i> Selecciona un género
          </div>
        </div>

        <!-- Navegación -->
        <div class="d-flex gap-2 mt-3">
          <button type="button" class="btn btn-outline-secondary py-3 px-4" style="border-radius:12px;"
            (click)="back.emit()">
            <i class="bi bi-arrow-left"></i>
          </button>
          <button type="submit" class="btn flex-fill fw-bold py-3"
            style="background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;border-radius:12px;border:none;">
            Siguiente <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class StepTwoComponent implements OnInit {
  @Output() next = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombres:   ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      dni:       ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono:  ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      genero:    ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.next.emit(this.form.value);
  }
}
