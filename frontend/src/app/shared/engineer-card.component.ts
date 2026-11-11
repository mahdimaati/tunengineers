import { Component, input, output } from '@angular/core';
import { Engineer } from '../core/api.service';
import { AvatarComponent } from './avatar.component';
import { VerifiedBadgeComponent } from './verified-badge.component';

@Component({
  selector: 'app-engineer-card',
  imports: [AvatarComponent, VerifiedBadgeComponent],
  template: `
    <button type="button" class="card eng-card" (click)="open.emit(eng())" [attr.aria-label]="'Voir la fiche de ' + eng().nom">
      <app-verified-badge />
      <app-avatar [nom]="eng().nom" [id]="eng().id" [photo]="eng().photo" />
      <span class="name">{{ eng().nom }}</span>
      <span class="sub">{{ eng().domaine }} · {{ eng().ville }}</span>
      <span class="tag">{{ eng().domaine }}</span>
    </button>`,
})
export class EngineerCardComponent {
  eng = input.required<Engineer>();
  open = output<Engineer>();
}
