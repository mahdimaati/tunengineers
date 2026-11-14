import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { IconComponent } from '../shared/icon.component';
import { LogoComponent } from '../shared/logo.component';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink, LogoComponent, IconComponent],
  template: `
    <div class="login-split">
      <aside class="login-brand">
        <app-logo [size]="64" [badge]="true" />
        <h2>TunEngineers</h2>
        <p>Espace réservé à l'administrateur : vérification des profils et lecture des messages.</p>
        <ul>
          <li><app-icon name="shield" [size]="18" /> Contrôle du diplôme et du LinkedIn</li>
          <li><app-icon name="check-circle" [size]="18" /> Approbation avant publication</li>
          <li><app-icon name="inbox" [size]="18" /> Messages de contact</li>
        </ul>
        <a routerLink="/" class="back">← Retour au site</a>
      </aside>

      <div class="login-wrap">
        <form class="card login-card" (ngSubmit)="login()" aria-labelledby="t">
          <h1 id="t">Espace administrateur</h1>
          <div>
            <label class="lbl" for="id">Identifiant</label>
            <input id="id" class="field" name="identifiant" [(ngModel)]="identifiant" autocomplete="username" required />
          </div>
          <div>
            <label class="lbl" for="pw">Mot de passe</label>
            <input id="pw" class="field" type="password" name="mdp" [(ngModel)]="motDePasse" autocomplete="current-password" required />
          </div>
          @if (error()) { <p class="error-box" role="alert">{{ error() }}</p> }
          <button class="btn btn-block" type="submit" [disabled]="loading()">{{ loading() ? 'Connexion…' : 'Connexion' }}</button>
          <p class="note">URL non listée dans le menu public</p>
        </form>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  identifiant = '';
  motDePasse = '';
  error = signal('');
  loading = signal(false);

  login() {
    this.error.set('');
    this.loading.set(true);
    this.api.adminLogin(this.identifiant, this.motDePasse).subscribe({
      next: () => this.router.navigate(['/gestion-admin/tableau']),
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.status === 429 ? 'Trop de tentatives. Réessayez plus tard.' : e.error?.error || 'Connexion impossible.');
      },
    });
  }
}
