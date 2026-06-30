// ============================================================
// highlight-appointment.directive.ts
// Directiva personalizada que resalta visualmente las citas
// del día actual o próximas (dentro de los próximos 3 días).
//
// EVIDENCIA ACADÉMICA: Directiva personalizada requerida por la rúbrica.
// ============================================================

import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';

/**
 * HighlightAppointmentDirective
 * Aplica estilos CSS al elemento host según la proximidad de la cita.
 *
 * Uso en template:
 *   <div [appHighlightAppointment]="appointment.date"> ... </div>
 *
 * Comportamiento:
 *   - Si la cita es HOY      → borde naranja + fondo naranja suave + badge "¡Hoy!"
 *   - Si la cita es PRÓXIMA (≤3 días) → borde azul + fondo azul suave
 *   - Si la cita es FUTURA   → sin cambios visuales
 */
@Directive({
  selector: '[appHighlightAppointment]',
  standalone: true,
})
export class HighlightAppointmentDirective implements OnInit {

  /** Fecha de la cita en formato ISO (YYYY-MM-DD) */
  @Input() appHighlightAppointment!: string;

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (!this.appHighlightAppointment) return;

    const today     = new Date();
    today.setHours(0, 0, 0, 0);

    const apptDate  = new Date(this.appHighlightAppointment + 'T00:00:00');
    const diffMs    = apptDate.getTime() - today.getTime();
    const diffDays  = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Cita HOY: resaltado naranja (color acento de PetTime)
      this.renderer.setStyle(this.el.nativeElement, 'border-left', '4px solid #F29455');
      this.renderer.setStyle(this.el.nativeElement, 'background', 'rgba(242,148,85,0.06)');
      this.addBadge('¡Hoy!', '#F29455');

    } else if (diffDays > 0 && diffDays <= 3) {
      // Cita en los próximos 3 días: resaltado azul (color primario de PetTime)
      this.renderer.setStyle(this.el.nativeElement, 'border-left', '4px solid #32ACDC');
      this.renderer.setStyle(this.el.nativeElement, 'background', 'rgba(50,172,220,0.04)');
    }
    // Si diffDays < 0 → cita pasada, no aplica (no debería estar en activas)
  }

  /**
   * Crea e inserta un badge "¡Hoy!" en el elemento host.
   */
  private addBadge(text: string, color: string): void {
    const badge = this.renderer.createElement('span');
    this.renderer.setStyle(badge, 'background', color);
    this.renderer.setStyle(badge, 'color', '#fff');
    this.renderer.setStyle(badge, 'font-size', '10px');
    this.renderer.setStyle(badge, 'font-weight', '700');
    this.renderer.setStyle(badge, 'padding', '2px 8px');
    this.renderer.setStyle(badge, 'border-radius', '20px');
    this.renderer.setStyle(badge, 'margin-left', '8px');
    this.renderer.setStyle(badge, 'vertical-align', 'middle');
    const textNode = this.renderer.createText(text);
    this.renderer.appendChild(badge, textNode);
    // Busca el título del servicio (h6) para insertar el badge al lado
    const title = this.el.nativeElement.querySelector('.appt-title');
    if (title) {
      this.renderer.appendChild(title, badge);
    }
  }
}
