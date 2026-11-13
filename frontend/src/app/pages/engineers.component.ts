import { Component, DestroyRef, ElementRef, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, switchMap, catchError, of } from 'rxjs';
import { ApiService, Engineer } from '../core/api.service';
import { AvatarComponent } from '../shared/avatar.component';
import { EngineerCardComponent } from '../shared/engineer-card.component';
import { VerifiedBadgeComponent } from '../shared/verified-badge.component';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-engineers',
  imports: [AvatarComponent, EngineerCardComponent, VerifiedBadgeComponent, IconComponent],
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <header class="banner">
      <div class="container banner-in">
        <div>
          <h1>Annuaire des ingénieurs</h1>
          <p>Des profils validés manuellement : diplôme et LinkedIn contrôlés. Filtrez par domaine, ville ou compétence.</p>
        </div>
        <img src="media/hero.svg" alt="" width="300" height="254" />
      </div>
    </header>

    <div class="container page">
      <div class="toolbar">
        <span class="count" aria-live="polite">{{ list().length }} profil{{ list().length > 1 ? 's' : '' }} vérifié{{ list().length > 1 ? 's' : '' }}</span>
        <div class="toolbar-right">
          @if (hasFilters()) { <button type="button" class="link-btn" (click)="reset()"><app-icon name="x" [size]="14" /> Réinitialiser les filtres</button> }
          <label class="sr-only" for="tri">Trier par</label>
          <select id="tri" class="field sort" [value]="tri()" (change)="tri.set($any($event.target).value)">
            <option value="recent">Plus récents</option>
            <option value="nom">Nom (A → Z)</option>
            <option value="experience">Expérience</option>
          </select>
        </div>
      </div>

      <form class="filters" role="search" (submit)="$event.preventDefault()">
        <div>
          <label class="sr-only" for="q">Rechercher un nom ou une compétence</label>
          <input id="q" class="field" type="search" placeholder="Rechercher un nom, une compétence…" [value]="q()" (input)="onSearch($any($event.target).value)" />
        </div>
        <div>
          <label class="sr-only" for="dom">Domaine</label>
          <select id="dom" class="field" [value]="domaine()" (change)="setDomaine($any($event.target).value)">
            <option value="">Domaine</option>
            @for (d of domaines(); track d) { <option [value]="d" [selected]="d === domaine()">{{ d }}</option> }
          </select>
        </div>
        <div>
          <label class="sr-only" for="ville">Ville</label>
          <select id="ville" class="field" [value]="ville()" (change)="setVille($any($event.target).value)">
            <option value="">Ville</option>
            @for (v of villes(); track v) { <option [value]="v" [selected]="v === ville()">{{ v }}</option> }
          </select>
        </div>
      </form>

      <div class="chips" role="group" aria-label="Filtrer par domaine">
        <button type="button" class="chip" [attr.aria-pressed]="domaine() === ''" (click)="setDomaine('')">Tous</button>
        @for (d of domaines(); track d) {
          <button type="button" class="chip" [attr.aria-pressed]="domaine() === d" (click)="setDomaine(d)">{{ d }}</button>
        }
      </div>

      @if (error()) {
        <p class="error-box" role="alert">Impossible de charger l'annuaire. Réessayez dans un instant.</p>
      } @else if (loading()) {
        <div class="grid" aria-hidden="true">@for (n of [1,2,3,4,5,6,7,8]; track n) { <div class="card skeleton sk-card"></div> }</div>
      } @else if (list().length === 0) {
        <div class="empty"><p>Aucun profil ne correspond à votre recherche.</p><button type="button" class="btn btn-secondary" style="margin-top:14px" (click)="reset()">Réinitialiser les filtres</button></div>
      } @else {
        <div class="grid">
          @for (e of sorted(); track e.id) {
            <app-engineer-card [eng]="e" (open)="open($event)" />
          }
        </div>
      }
    </div>

    @if (selected(); as s) {
      <div class="overlay" (click)="close()">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="fiche-titre" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <app-avatar [nom]="s.nom" [id]="s.id" [photo]="s.photo" size="lg" />
            <div>
              <h2 id="fiche-titre">{{ s.nom }}</h2>
              <div class="sub">Ingénieur {{ s.domaine.toLowerCase() }} · {{ s.ville }}</div>
              <app-verified-badge />
            </div>
            <button #closeBtn type="button" class="modal-close" aria-label="Fermer la fiche" (click)="close()">×</button>
          </div>
          <div class="modal-body">
            <div class="info-grid">
              <div class="info"><small>Domaine</small><b>{{ s.domaine }}</b></div>
              <div class="info"><small>Ville</small><b>{{ s.ville }}</b></div>
              <div class="info"><small>Expérience</small><b>{{ s.experience }}</b></div>
            </div>
            @if (s.competences.length) {
              <div>
                <div class="label-sm">Compétences</div>
                <div class="skills">@for (c of s.competences; track c) { <span class="tag">{{ c }}</span> }</div>
              </div>
            }
            <div class="modal-actions">
              @if (s.linkedin) {
                <a class="btn btn-secondary" [href]="s.linkedin" target="_blank" rel="noopener noreferrer">Profil LinkedIn<span class="sr-only"> (nouvel onglet)</span></a>
              } @else {
                <span></span>
              }
              <button type="button" class="btn" (click)="contact(s)" [disabled]="contactLoading() || !!contactInfo()">Contacter</button>
            </div>
            @if (contactInfo(); as c) {
              <div class="reveal" role="status">
                <span>Email : <a [href]="'mailto:' + c.email">{{ c.email }}</a></span>
                @if (c.telephone) { <span>Téléphone : <a [href]="'tel:' + c.telephone.replace(' ', '')">{{ c.telephone }}</a></span> }
              </div>
            } @else if (contactError()) {
              <p class="error-box" role="alert">{{ contactError() }}</p>
            } @else {
              <p class="note">Email et téléphone affichés après clic sur « Contacter ».</p>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class EngineersComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  domaines = signal<string[]>([]);
  villes = signal<string[]>([]);
  list = signal<Engineer[]>([]);
  loading = signal(true);
  error = signal(false);
  q = signal('');
  domaine = signal('');
  ville = signal('');
  tri = signal<'recent' | 'nom' | 'experience'>('recent');
  hasFilters = computed(() => !!(this.q() || this.domaine() || this.ville()));
  private niveau: Record<string, number> = { 'Jeune diplômé': 0, '1 à 2 ans': 1, '3 à 5 ans': 2, '6 à 10 ans': 3, 'Plus de 10 ans': 4 };
  sorted = computed(() => {
    const l = [...this.list()];
    if (this.tri() === 'nom') l.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    else if (this.tri() === 'experience') l.sort((a, b) => (this.niveau[b.experience] ?? 0) - (this.niveau[a.experience] ?? 0) || a.nom.localeCompare(b.nom, 'fr'));
    return l;
  });

  selected = signal<Engineer | null>(null);
  contactInfo = signal<{ email: string; telephone: string | null } | null>(null);
  contactError = signal('');
  contactLoading = signal(false);
  closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  private search$ = new Subject<void>();

  constructor() {
    // Focus sur le bouton Fermer à l'ouverture de la fiche (accessibilité clavier)
    effect(() => { this.closeBtn()?.nativeElement.focus(); });
  }

  ngOnInit() {
    this.api.meta().subscribe({ next: (m) => this.domaines.set(m.domaines) });
    this.api.villes().subscribe({ next: (v) => this.villes.set(v) });

    const qp = this.route.snapshot.queryParamMap;
    this.q.set(qp.get('q') ?? '');
    this.domaine.set(qp.get('domaine') ?? '');
    this.ville.set(qp.get('ville') ?? '');

    this.search$.pipe(
      debounceTime(200),
      switchMap(() => {
        this.loading.set(true);
        this.router.navigate([], { relativeTo: this.route, replaceUrl: true, queryParamsHandling: 'merge',
          queryParams: { q: this.q() || null, domaine: this.domaine() || null, ville: this.ville() || null } });
        return this.api.engineers({ q: this.q(), domaine: this.domaine(), ville: this.ville() }).pipe(
          catchError(() => { this.error.set(true); return of([] as Engineer[]); }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((rows) => { this.list.set(rows); this.loading.set(false); });
    this.search$.next();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      const id = Number(p.get('id'));
      this.contactInfo.set(null);
      this.contactError.set('');
      if (!id) { this.selected.set(null); return; }
      this.api.engineer(id).subscribe({
        next: (e) => this.selected.set(e),
        error: () => { this.selected.set(null); this.router.navigate(['/ingenieurs']); },
      });
    });
  }

  reset() { this.q.set(''); this.domaine.set(''); this.ville.set(''); this.search$.next(); }
  onSearch(v: string) { this.q.set(v); this.search$.next(); }
  setDomaine(v: string) { this.domaine.set(v); this.search$.next(); }
  setVille(v: string) { this.ville.set(v); this.search$.next(); }

  open(e: Engineer) { this.router.navigate(['/ingenieurs', e.id], { queryParamsHandling: 'preserve' }); }
  close() { if (this.selected()) this.router.navigate(['/ingenieurs'], { queryParamsHandling: 'preserve' }); }

  contact(e: Engineer) {
    this.contactLoading.set(true);
    this.contactError.set('');
    this.api.contact(e.id).subscribe({
      next: (r) => { this.contactInfo.set(r); this.contactLoading.set(false); },
      error: (err) => {
        this.contactError.set(err.status === 429 ? 'Trop de demandes. Réessayez plus tard.' : 'Impossible de récupérer les coordonnées.');
        this.contactLoading.set(false);
      },
    });
  }
}
