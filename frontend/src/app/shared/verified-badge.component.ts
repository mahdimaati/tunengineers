import { Component } from '@angular/core';

/** Badge « Vérifié » : le sens n'est jamais porté par la couleur seule (icône + texte). */
@Component({
  selector: 'app-verified-badge',
  template: `<span class="badge-ok"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Vérifié</span>`,
})
export class VerifiedBadgeComponent {}
