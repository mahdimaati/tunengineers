import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService, Company } from '../core/api.service';

@Component({
  selector: 'app-companies',
  template: `
    <div class="container page">
      <div class="page-head"><h1>Entreprises qui recrutent des ingénieurs</h1></div>

      <div class="chips" role="group" aria-label="Filtrer par secteur">
        <button type="button" class="chip" [attr.aria-pressed]="secteur() === ''" (click)="select('')">Tous</button>
        @for (s of secteurs(); track s) {
          <button type="button" class="chip" [attr.aria-pressed]="secteur() === s" (click)="select(s)">{{ s }}</button>
        }
      </div>

      @if (error()) {
        <p class="error-box" role="alert">Impossible de charger les entreprises.</p>
      } @else if (loading()) {
        <p class="empty" role="status">Chargement…</p>
      } @else {
        <div class="grid three">
          @for (c of companies(); track c.id) {
            <article class="card co-card">
              <div class="co-top">
                <span class="co-logo" aria-hidden="true">
                  @if (c.logo) { <img [src]="c.logo" alt="" width="48" height="48" loading="lazy" /> } @else { <span class="co-mono">{{ c.nom.charAt(0) }}</span> }
                </span>
                <span class="tag" style="margin:0">{{ c.secteur }}</span>
              </div>
              <h2 class="name" style="font-size:16px">{{ c.nom }}</h2>
              <p class="city">{{ c.ville }}</p>
              <a class="btn btn-block" [href]="c.site_web" target="_blank" rel="noopener noreferrer">Site officiel<span class="sr-only"> de {{ c.nom }} (nouvel onglet)</span></a>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class CompaniesComponent implements OnInit {
  private api = inject(ApiService);
  secteurs = signal<string[]>([]);
  companies = signal<Company[]>([]);
  secteur = signal('');
  loading = signal(true);
  error = signal(false);

  ngOnInit() {
    this.api.secteurs().subscribe({ next: (s) => this.secteurs.set(s) });
    this.load();
  }

  select(s: string) { this.secteur.set(s); this.load(); }

  private load() {
    this.loading.set(true);
    this.api.companies(this.secteur()).subscribe({
      next: (c) => { this.companies.set(c); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
