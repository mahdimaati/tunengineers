import { Component, input, output } from '@angular/core';
import { Engineer } from '../core/api.service';
import { AvatarComponent } from './avatar.component';
import { IconComponent } from './icon.component';
import { VerifiedBadgeComponent } from './verified-badge.component';

@Component({
  selector: 'app-engineer-card',
  imports: [AvatarComponent, VerifiedBadgeComponent, IconComponent],
  template: `
    <button type="button" class="card eng-card" (click)="open.emit(eng())" [attr.aria-label]="'Voir la fiche de ' + eng().nom">
      <app-verified-badge />
      <app-avatar [nom]="eng().nom" [id]="eng().id" [photo]="eng().photo" size="lg" />
      <span class="name">{{ eng().nom }}</span>
      <span class="sub"><app-icon name="pin" [size]="13" /> {{ eng().ville }}</span>
      <span class="tag">{{ eng().domaine }}</span>
      <span class="exp">{{ eng().experience }}</span>
      @if (eng().competences.length) {
        <span class="mini-skills">
          @for (c of eng().competences.slice(0, 3); track c) { <span>{{ c }}</span> }
        </span>
      }
      <span class="more">Voir la fiche <app-icon name="arrow-right" [size]="14" /></span>
    </button>`,
})
export class EngineerCardComponent {
  eng = input.required<Engineer>();
  open = output<Engineer>();
}
