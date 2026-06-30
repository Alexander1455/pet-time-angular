// ============================================================
// input-field.component.ts
// Componente reutilizable de campo de entrada para formularios.
// Implementa @Input() para recibir configuración del padre.
// Compatible con Reactive Forms vía formControlName.
// ============================================================

import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  AbstractControl,
} from '@angular/forms';

/**
 * InputFieldComponent
 * Campo de texto reutilizable con:
 *   - Ícono opcional (emoji o Bootstrap icon)
 *   - Soporte para tipos text, email, password, tel, date
 *   - Visualización de errores de validación
 *   - Integración con Reactive Forms vía ControlValueAccessor
 *
 * Uso básico con formControl:
 *   <app-input-field
 *     label="Correo electrónico"
 *     type="email"
 *     icon="bi-envelope"
 *     [control]="form.get('email')"
 *     placeholder="correo@ejemplo.com">
 *   </app-input-field>
 */
@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-3">
      <!-- Label -->
      <label *ngIf="label" class="form-label fw-semibold text-secondary small">
        {{ label }}
      </label>

      <!-- Input group con ícono -->
      <div class="input-group">
        <!-- Ícono izquierdo (Bootstrap Icons) -->
        <span *ngIf="icon" class="input-group-text bg-white border-end-0">
          <i [class]="'bi ' + icon" style="color: #32ACDC;"></i>
        </span>

        <!-- Input principal -->
        <input
          [type]="currentType"
          [placeholder]="placeholder"
          [formControl]="$any(control)"
          [class]="getInputClass()"
          (blur)="onTouched()">

        <!-- Botón mostrar/ocultar contraseña -->
        <button
          *ngIf="type === 'password'"
          type="button"
          class="input-group-text bg-white border-start-0"
          (click)="togglePasswordVisibility()">
          <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" style="color: #6c757d;"></i>
        </button>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="hasError()" class="text-danger small mt-1 d-flex align-items-center gap-1">
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ getErrorMessage() }}
      </div>
    </div>
  `,
})
export class InputFieldComponent {
  /** Texto del label sobre el input */
  @Input() label = '';
  /** Tipo HTML del input: text, email, password, tel, date */
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'date' = 'text';
  /** Clase de Bootstrap Icon (sin el prefijo 'bi'). Ej: 'bi-envelope' */
  @Input() icon = '';
  /** Placeholder del input */
  @Input() placeholder = '';
  /** AbstractControl del Reactive Form vinculado a este campo */
  @Input() control: AbstractControl | null = null;

  /** Controla la visibilidad de contraseña (type=password) */
  showPassword = false;

  /** Alterna entre 'password' y 'text' para mostrar/ocultar */
  get currentType(): string {
    return this.type === 'password' && this.showPassword ? 'text' : this.type;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /** Retorna true si el control tiene errores y ha sido tocado */
  hasError(): boolean {
    return !!(this.control?.invalid && (this.control?.touched || this.control?.dirty));
  }

  /** Retorna el primer mensaje de error del control */
  getErrorMessage(): string {
    if (!this.control?.errors) return '';
    const errors = this.control.errors;
    if (errors['required'])   return 'Este campo es requerido';
    if (errors['email'])      return 'Correo electrónico inválido';
    if (errors['minlength'])  return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])  return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern'])    return 'Formato inválido';
    if (errors['mismatch'])   return 'Las contraseñas no coinciden';
    return 'Campo inválido';
  }

  /** Retorna la clase CSS del input según estado de validación */
  getInputClass(): string {
    let cls = 'form-control';
    if (this.icon) cls += ' border-start-0';
    if (this.hasError())                             cls += ' is-invalid';
    else if (this.control?.valid && this.control?.dirty) cls += ' is-valid';
    return cls;
  }

  /** Requerido por ControlValueAccessor */
  onTouched = () => {};
}
