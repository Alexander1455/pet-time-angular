// ============================================================
// step-one.component.ts — Paso 1: Email y contraseña
// ============================================================
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';

/** Validador personalizado: confirma que ambas contraseñas coincidan */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pass    = control.get('password');
  const confirm = control.get('confirm');
  if (pass && confirm && pass.value !== confirm.value) {
    confirm.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-step-one',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  template: `
    <div class="w-100 card border-0 shadow-sm p-4" style="border-radius:20px;">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <app-input-field label="Correo electrónico" type="email" icon="bi-envelope"
          placeholder="correo@ejemplo.com" [control]="form.get('email')">
        </app-input-field>

        <app-input-field label="Contraseña" type="password" icon="bi-lock"
          placeholder="Mínimo 6 caracteres" [control]="form.get('password')">
        </app-input-field>

        <app-input-field label="Confirmar contraseña" type="password" icon="bi-lock-fill"
          placeholder="Repite tu contraseña" [control]="form.get('confirm')">
        </app-input-field>

        <button type="submit" class="btn w-100 fw-bold py-3 mt-2"
          style="background:linear-gradient(135deg,#32ACDC,#1a8ab5);color:#fff;border-radius:12px;border:none;">
          Siguiente <i class="bi bi-arrow-right"></i>
        </button>
      </form>
    </div>
  `,
})
export class StepOneComponent implements OnInit {
  @Output() next = new EventEmitter<{ email: string; password: string }>();
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm:  ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password } = this.form.value;
    this.next.emit({ email, password });
  }
}
