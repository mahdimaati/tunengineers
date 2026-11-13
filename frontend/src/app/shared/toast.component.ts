import { Component, Injectable, inject, signal } from '@angular/core';
import { IconComponent } from './icon.component';

export interface Toast { id: number; text: string; kind: 'ok' | 'error' | 'info'; }

/** Notifications éphémères (confirmation d'envoi, erreurs…). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private next = 1;

  show(text: string, kind: Toast['kind'] = 'ok', ms = 4500) {
    const id = this.next++;
    this.toasts.update((t) => [...t, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), ms);
  }
  ok(text: string) { this.show(text, 'ok'); }
  error(text: string) { this.show(text, 'error', 6500); }
  dismiss(id: number) { this.toasts.update((t) => t.filter((x) => x.id !== id)); }
}

@Component({
  selector: 'app-toasts',
  imports: [IconComponent],
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (t of svc.toasts(); track t.id) {
        <div class="toast" [class]="'toast ' + t.kind" [attr.role]="t.kind === 'error' ? 'alert' : 'status'">
          <app-icon [name]="t.kind === 'ok' ? 'check-circle' : t.kind === 'error' ? 'alert' : 'info'" />
          <span>{{ t.text }}</span>
          <button type="button" aria-label="Fermer la notification" (click)="svc.dismiss(t.id)"><app-icon name="x" [size]="16" /></button>
        </div>
      }
    </div>`,
})
export class ToastsComponent {
  svc = inject(ToastService);
}
