import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, Company } from '../core/api.service';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';

@Component({
  selector: 'app-companies',
  imports: [IconComponent, RevealDirective],
  template: `
    <header class="banner">
      <div class="container banner-in">
        <div>
          <h1>Entreprises qui recrutent des ingénieurs</h1>
          <p>{{ companies().length }} entreprises référencées dans {{ secteurs().length }} secteurs d'activité. Accédez directement à leur site officiel.</p>
        </div>
        <img src="media/companies.svg" alt="" width="300" height="200" />
      </div>
    </header>

    <div class="container page">
      <div class="toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="18" />
          <label class="sr-only" for="cq">Rechercher une entreprise</label>
          <input id="cq" class="field" type="search" placeholder="Rechercher une entreprise ou une ville…" [value]="q()" (input)="q.set($any($event.target).value)" />
        </div>
        <span class="count" aria-live="polite">{{ shown().length }} résultat{{ shown().length > 1 ? 's' : '' }}</span>
      </div>

      <div class="chips" role="group" aria-label="Filtrer par secteur">
        <button type="button" class="chip" [attr.aria-pressed]="secteur() === ''" (click)="select('')">Tous</button>
        @for (s of secteurs(); track s) {
          <button type="button" class="chip" [attr.aria-pressed]="secteur() === s" (click)="select(s)">{{ s }}</button>
        }
      </div>

      @if (error()) {
        <p class="error-box" role="alert">Impossible de charger les entreprises.</p>
      } @else if (loading()) {
        <div class="grid three" aria-hidden="true">@for (n of [1,2,3,4,5,6]; track n) { <div class="card skeleton sk-co"></div> }</div>
      } @else if (shown().length === 0) {
        <p class="empty">Aucune entreprise ne correspond à votre recherche.</p>
      } @else {
        <div class="grid three">
          @for (c of shown(); track c.id; let i = $index) {
            <article class="card co-card" [style.--c]="color(c.secteur)" [appReveal]="(i % 3) * 60">
              <div class="co-top">
                <span class="co-logo" aria-hidden="true">
                  @if (c.logo) { <img [src]="c.logo" alt="" width="48" height="48" loading="lazy" /> } @else { <span class="co-mono">{{ c.nom.charAt(0) }}</span> }
                </span>
                <span class="tag" style="margin:0">{{ c.secteur }}</span>
              </div>
              <h2 class="name" style="font-size:16px">{{ c.nom }}</h2>
              <p class="city"><app-icon name="pin" [size]="14" /> {{ c.ville }}</p>
              <a class="btn btn-block" [href]="c.site_web" target="_blank" rel="noopener noreferrer">Site officiel <app-icon name="arrow-right" [size]="15" /><span class="sr-only"> de {{ c.nom }} (nouvel onglet)</span></a>
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
  q = signal('');
  loading = signal(true);
  error = signal(false);

  shown = computed(() => {
    const t = this.q().trim().toLowerCase();
    return t ? this.companies().filter((c) => (c.nom + ' ' + c.ville + ' ' + c.secteur).toLowerCase().includes(t)) : this.companies();
  });

  ngOnInit() {
    this.api.secteurs().subscribe({ next: (s) => this.secteurs.set(s) });
    this.load();
  }

  private colors: Record<string, string> = { 'Télécoms': '#7c3aed', 'Informatique': '#4f46e5', 'Industrie': '#0e7490', 'Énergie': '#16a34a', 'Automobile': '#be123c', 'Aéronautique': '#0284c7', 'Transport': '#ca8a04', 'BTP': '#b45309', 'Chimie': '#db2777' };
  color(s: string) { return this.colors[s] ?? '#4f46e5'; }

  select(s: string) { this.secteur.set(s); this.load(); }

  private load() {
    this.loading.set(true);
    this.api.companies(this.secteur()).subscribe({
      next: (c) => { this.companies.set(c); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
