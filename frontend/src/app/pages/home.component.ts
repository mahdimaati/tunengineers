import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, Company, Engineer, Stats } from '../core/api.service';
import { EngineerCardComponent } from '../shared/engineer-card.component';
import { IconComponent } from '../shared/icon.component';
import { CountUpDirective, RevealDirective } from '../shared/motion.directives';

@Component({
  selector: 'app-home',
  imports: [RouterLink, EngineerCardComponent, IconComponent, RevealDirective, CountUpDirective],
  template: `
    <!-- ===== Hero ===== -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="container">
        <div>
          <span class="pill-badge">Plateforme 100 % tunisienne</span>
          <h1 id="hero-title">Trouvez les <em>ingénieurs vérifiés</em> de toute la Tunisie</h1>
          <p class="lead">Un annuaire fiable où chaque profil est validé manuellement : diplôme et LinkedIn contrôlés avant publication.</p>

          <form class="hero-search" role="search" (submit)="search($event)">
            <label class="sr-only" for="hq">Compétence ou nom</label>
            <input id="hq" class="field" type="search" name="q" placeholder="Compétence, nom… (ex. SCADA, Python)" [value]="q()" (input)="q.set($any($event.target).value)" />
            <label class="sr-only" for="hd">Domaine</label>
            <select id="hd" class="field" name="domaine" (change)="dom.set($any($event.target).value)">
              <option value="">Domaine</option>
              @for (d of domaines; track d) { <option [value]="d">{{ d }}</option> }
            </select>
            <button type="submit" class="btn btn-cyan"><app-icon name="search" [size]="18" [stroke]="2.4" /> Rechercher</button>
          </form>

          <div class="actions">
            <a class="btn btn-ghost" routerLink="/inscription">Rejoindre la communauté <app-icon name="arrow-right" [size]="16" /></a>
            <a class="btn btn-ghost" href="#video"><app-icon name="play" [size]="14" /> Voir la vidéo</a>
          </div>
        </div>
        <div class="hero-art">
          <img src="media/hero.svg" alt="Illustration : un profil d'ingénieur vérifié relié aux domaines d'ingénierie" width="520" height="440" fetchpriority="high" />
        </div>
      </div>
    </section>

    <div class="container">
      <!-- ===== Chiffres clés ===== -->
      <section class="stats" aria-label="Chiffres clés">
        <div class="stat"><b [appCountUp]="stats()?.ingenieurs">–</b><span>ingénieurs vérifiés</span></div>
        <div class="stat"><b [appCountUp]="stats()?.domaines">–</b><span>domaines d'ingénierie</span></div>
        <div class="stat"><b [appCountUp]="stats()?.entreprises">–</b><span>entreprises partenaires</span></div>
        <div class="stat"><b>100 %</b><span>profils validés à la main</span></div>
      </section>

      <!-- ===== Entreprises (défilement de logos) ===== -->
      @if (logos().length) {
        <section class="section" aria-labelledby="partners" appReveal>
          <p id="partners" class="eyebrow">Des entreprises tunisiennes et internationales qui recrutent des ingénieurs</p>
          <div class="marquee">
            <ul class="marquee-track">
              @for (c of logos(); track c.id) { <li><img [src]="c.logo" [alt]="c.nom" width="56" height="56" loading="lazy" /></li> }
              @for (c of logos(); track c.id) { <li aria-hidden="true"><img [src]="c.logo" alt="" width="56" height="56" loading="lazy" /></li> }
            </ul>
          </div>
        </section>
      }

      <!-- ===== Domaines ===== -->
      <section class="section" aria-labelledby="doms">
        <div class="section-head" appReveal>
          <div><h2 id="doms">Explorer par domaine d'ingénierie</h2><p class="sub">Cliquez sur un domaine pour filtrer l'annuaire.</p></div>
          <a routerLink="/ingenieurs">Tous les ingénieurs <app-icon name="arrow-right" [size]="15" /></a>
        </div>
        <div class="domain-grid">
          @for (d of domaines; track d; let i = $index) {
            <a class="domain" [routerLink]="['/ingenieurs']" [queryParams]="{ domaine: d }" [appReveal]="i * 50">
              <span class="ico"><app-icon [name]="d" [size]="24" /></span>
              <b>{{ d }}</b>
              <span class="n">{{ counts()[d] ?? 0 }} profil{{ (counts()[d] ?? 0) > 1 ? 's' : '' }}</span>
            </a>
          }
        </div>
      </section>

      <!-- ===== Comment ça marche ===== -->
      <section class="section" aria-labelledby="how">
        <div class="section-head" appReveal><h2 id="how">Comment ça marche ?</h2></div>
        <ol class="steps">
          <li class="step" appReveal><span class="num" aria-hidden="true">1</span><div><h3><app-icon name="user-plus" [size]="18" /> S'inscrire</h3><p>Un formulaire en une page, avec votre consentement explicite à la publication.</p></div></li>
          <li class="step" [appReveal]="100"><span class="num" aria-hidden="true">2</span><div><h3><app-icon name="shield" [size]="18" /> Être vérifié</h3><p>L'administrateur contrôle votre diplôme et votre profil LinkedIn avant toute publication.</p></div></li>
          <li class="step" [appReveal]="200"><span class="num" aria-hidden="true">3</span><div><h3><app-icon name="search" [size]="18" /> Être visible</h3><p>Votre profil devient public ; vos coordonnées ne s'affichent qu'au clic sur « Contacter ».</p></div></li>
        </ol>
      </section>

      <!-- ===== Pourquoi ===== -->
      <section class="section" aria-labelledby="why">
        <div class="section-head" appReveal><h2 id="why">Pourquoi TunEngineers ?</h2></div>
        <div class="features">
          <article class="feature card" appReveal><span class="ico"><app-icon name="shield" [size]="24" /></span><h3>Profils vérifiés</h3><p>Aucun profil n'est publié sans contrôle manuel du diplôme et du LinkedIn.</p></article>
          <article class="feature card" [appReveal]="80"><span class="ico"><app-icon name="eye-off" [size]="24" /></span><h3>Contact protégé</h3><p>Email et téléphone restent masqués tant que l'on n'a pas cliqué sur « Contacter ».</p></article>
          <article class="feature card" [appReveal]="160"><span class="ico"><app-icon name="lock" [size]="24" /></span><h3>Diplôme confidentiel</h3><p>Le justificatif n'est visible que de l'administrateur, jamais du public.</p></article>
          <article class="feature card" [appReveal]="240"><span class="ico"><app-icon name="gift" [size]="24" /></span><h3>Gratuit et simple</h3><p>Inscription gratuite, suppression du profil sur simple demande.</p></article>
        </div>
      </section>

      <!-- ===== Vidéo ===== -->
      <section class="section video-section" id="video" aria-labelledby="vid">
        <div class="section-head" appReveal><div><h2 id="vid">TunEngineers en 18 secondes</h2><p class="sub">Le parcours d'un ingénieur, de l'inscription à la visibilité.</p></div></div>
        <div class="video-frame" appReveal>
          <video controls preload="metadata" playsinline poster="media/promo-poster.jpg" aria-describedby="vid-desc">
            <source src="media/promo.mp4" type="video/mp4" />
            <source src="media/promo.webm" type="video/webm" />
            Votre navigateur ne peut pas lire cette vidéo. Le parcours est décrit juste en dessous.
          </video>
        </div>
        <p id="vid-desc" class="note" style="margin-top:10px">Vidéo sans son. En résumé : 1) je m'inscris, 2) l'administrateur vérifie mon diplôme et mon LinkedIn, 3) mon profil devient visible des entreprises.</p>
      </section>

      <!-- ===== Derniers profils ===== -->
      <section class="section" aria-labelledby="last">
        <div class="section-head" appReveal>
          <h2 id="last">Derniers profils approuvés</h2>
          <a routerLink="/ingenieurs">Voir tous les ingénieurs <app-icon name="arrow-right" [size]="15" /></a>
        </div>
        @if (error()) {
          <p class="error-box" role="alert">Impossible de charger les profils pour le moment.</p>
        } @else if (!loaded()) {
          <div class="grid" aria-hidden="true">@for (n of [1,2,3,4]; track n) { <div class="card skeleton sk-card"></div> }</div>
        } @else if (latest().length === 0) {
          <p class="empty">Aucun profil approuvé pour l'instant.</p>
        } @else {
          <div class="grid">
            @for (e of latest(); track e.id; let i = $index) {
              <div [appReveal]="i * 70"><app-engineer-card [eng]="e" (open)="go($event)" /></div>
            }
          </div>
        }
      </section>

      <!-- ===== Bandeau entreprises ===== -->
      <section class="cta-band" aria-labelledby="cta-co" appReveal>
        <div>
          <h2 id="cta-co">Vous recrutez des ingénieurs ?</h2>
          <p>Parcourez l'annuaire, ouvrez une fiche et cliquez sur « Contacter » : les coordonnées s'affichent immédiatement. Découvrez aussi les entreprises déjà référencées.</p>
          <div class="actions">
            <a class="btn btn-cyan" routerLink="/ingenieurs">Parcourir l'annuaire</a>
            <a class="btn btn-ghost" routerLink="/entreprises">Voir les entreprises</a>
          </div>
        </div>
        <img src="media/companies.svg" alt="" width="480" height="320" loading="lazy" />
      </section>

      <!-- ===== FAQ ===== -->
      <section class="section" aria-labelledby="faq">
        <div class="section-head" appReveal><h2 id="faq">Questions fréquentes</h2></div>
        <div class="faq" appReveal>
          @for (f of faq; track f.q) {
            <details>
              <summary>{{ f.q }}<app-icon name="chevron-down" [size]="18" /></summary>
              <p>{{ f.a }}</p>
            </details>
          }
        </div>
      </section>

      <!-- ===== Appel final ===== -->
      <section class="final-cta" aria-labelledby="fin" appReveal>
        <h2 id="fin">Votre talent mérite d'être vu.</h2>
        <p>Rejoignez la communauté des ingénieurs vérifiés de Tunisie.</p>
        <a class="btn btn-cyan" routerLink="/inscription">S'inscrire gratuitement <app-icon name="arrow-right" [size]="16" /></a>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  domaines = ['Informatique', 'Génie civil', 'Électrique', 'Télécoms', 'Industriel', 'Énergie', 'Chimie', 'Mécanique'];
  stats = signal<Stats | null>(null);
  all = signal<Engineer[]>([]);
  latest = computed(() => this.all().slice(0, 4));
  counts = computed(() => {
    const m: Record<string, number> = {};
    for (const e of this.all()) m[e.domaine] = (m[e.domaine] ?? 0) + 1;
    return m;
  });
  logos = signal<Company[]>([]);
  loaded = signal(false);
  error = signal(false);
  q = signal('');
  dom = signal('');

  faq = [
    { q: 'Comment mon profil est-il vérifié ?', a: "Un administrateur contrôle votre diplôme (document privé) et votre profil LinkedIn avant de publier votre profil. Tant que ce n'est pas fait, votre demande reste « en attente » et n'apparaît pas dans l'annuaire." },
    { q: 'Mes coordonnées sont-elles visibles de tous ?', a: "Non. Seuls le nom, la photo, le domaine, la ville, l'expérience, les compétences et le LinkedIn sont publics. L'email et le téléphone ne s'affichent qu'après un clic sur « Contacter ». Le diplôme n'est jamais public." },
    { q: "L'inscription est-elle gratuite ?", a: "Oui. TunEngineers est un projet pédagogique : l'inscription et la consultation de l'annuaire sont gratuites." },
    { q: 'Comment supprimer mon profil ?', a: "Écrivez-nous depuis la page Contact (sujet « Suppression de mon profil ») : votre profil, votre photo et votre justificatif sont effacés." },
    { q: 'Je suis une entreprise : comment contacter un ingénieur ?', a: "Ouvrez la fiche d'un ingénieur dans l'annuaire puis cliquez sur « Contacter » pour afficher son email et son téléphone." },
  ];

  ngOnInit() {
    forkJoin({ stats: this.api.stats(), eng: this.api.engineers({ limit: 100 }), co: this.api.companies() }).subscribe({
      next: (r) => {
        this.stats.set(r.stats);
        this.all.set(r.eng);
        this.logos.set(r.co.filter((c) => c.logo).filter((_, i) => i % 3 === 0).slice(0, 14));
        this.loaded.set(true);
      },
      error: () => { this.error.set(true); this.loaded.set(true); },
    });
  }

  search(ev: Event) {
    ev.preventDefault();
    const queryParams: Record<string, string> = {};
    if (this.q().trim()) queryParams['q'] = this.q().trim();
    if (this.dom()) queryParams['domaine'] = this.dom();
    this.router.navigate(['/ingenieurs'], { queryParams });
  }

  go(e: Engineer) { this.router.navigate(['/ingenieurs', e.id]); }
}
