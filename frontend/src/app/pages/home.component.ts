import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, Engineer, Stats } from '../core/api.service';
import { AvatarComponent } from '../shared/avatar.component';
import { EngineerCardComponent } from '../shared/engineer-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, AvatarComponent, EngineerCardComponent],
  template: `
    <section class="hero" aria-labelledby="hero-title">
      <div class="container">
        <div>
          <span class="pill-badge">Plateforme 100 % tunisienne</span>
          <h1 id="hero-title">Trouvez les <em>ingénieurs vérifiés</em> de toute la Tunisie</h1>
          <p class="lead">Un annuaire fiable où chaque profil est validé manuellement : diplôme et LinkedIn contrôlés avant publication.</p>
          <div class="actions">
            <a class="btn btn-cyan" routerLink="/inscription">Rejoindre la communauté <span aria-hidden="true">→</span></a>
            <a class="btn btn-ghost" routerLink="/ingenieurs">Explorer l'annuaire</a>
          </div>
        </div>
        <div class="hero-cards" aria-hidden="true">
          @for (e of latest().slice(0, 3); track e.id) {
            <div class="hero-card">
              <app-avatar [nom]="e.nom" [id]="e.id" [photo]="e.photo" size="sm" />
              <div><div class="n">{{ e.nom }}</div><div class="d">{{ e.domaine }} · {{ e.ville }}</div></div>
            </div>
          }
        </div>
      </div>
    </section>

    <div class="container">
      <section class="stats" aria-label="Chiffres clés">
        <div class="stat"><b>{{ stats()?.ingenieurs ?? '–' }}</b><span>ingénieurs vérifiés</span></div>
        <div class="stat"><b>{{ stats()?.domaines ?? '–' }}</b><span>domaines d'ingénierie</span></div>
        <div class="stat"><b>{{ stats()?.entreprises ?? '–' }}</b><span>entreprises partenaires</span></div>
        <div class="stat"><b>100 %</b><span>profils validés à la main</span></div>
      </section>

      <section class="section" aria-labelledby="how">
        <div class="section-head"><h2 id="how">Comment ça marche ?</h2></div>
        <div class="steps">
          <div class="step"><span class="num" aria-hidden="true">1</span><div><h3>S'inscrire</h3><p>Formulaire en une page, consentement explicite</p></div></div>
          <div class="step"><span class="num" aria-hidden="true">2</span><div><h3>Être vérifié</h3><p>L'administrateur contrôle diplôme et LinkedIn</p></div></div>
          <div class="step"><span class="num" aria-hidden="true">3</span><div><h3>Être visible</h3><p>Profil public, contact sécurisé par clic</p></div></div>
        </div>
      </section>

      <section class="section" aria-labelledby="last">
        <div class="section-head">
          <h2 id="last">Derniers profils approuvés</h2>
          <a routerLink="/ingenieurs">Voir tous les ingénieurs →</a>
        </div>
        @if (error()) {
          <p class="error-box" role="alert">Impossible de charger les profils pour le moment.</p>
        } @else if (loaded() && latest().length === 0) {
          <p class="empty">Aucun profil approuvé pour l'instant.</p>
        } @else {
          <div class="grid">
            @for (e of latest(); track e.id) {
              <app-engineer-card [eng]="e" (open)="go($event)" />
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  stats = signal<Stats | null>(null);
  latest = signal<Engineer[]>([]);
  loaded = signal(false);
  error = signal(false);

  ngOnInit() {
    forkJoin({ stats: this.api.stats(), latest: this.api.engineers({ limit: 4 }) }).subscribe({
      next: (r) => { this.stats.set(r.stats); this.latest.set(r.latest); this.loaded.set(true); },
      error: () => { this.error.set(true); this.loaded.set(true); },
    });
  }

  go(e: Engineer) { this.router.navigate(['/ingenieurs', e.id]); }
}
