import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LogoComponent } from './shared/logo.component';
import { IconComponent } from './shared/icon.component';
import { ToastsComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, IconComponent, ToastsComponent],
  template: `
    <a class="skip-link" href="#contenu">Aller au contenu</a>

    @if (!isAdmin()) {
      <header class="site-header" [class.scrolled]="scrolled()">
        <div class="container">
          <a class="brand" routerLink="/" aria-label="TunEngineers – accueil" (click)="menu.set(false)"><app-logo [size]="42" /> TunEngineers</a>
          <button type="button" class="burger" [attr.aria-expanded]="menu()" aria-controls="nav-principal" aria-label="Menu" (click)="menu.set(!menu())">
            <app-icon [name]="menu() ? 'x' : 'burger'" [size]="22" />
          </button>
          <nav id="nav-principal" class="nav" [class.open]="menu()" aria-label="Navigation principale" (click)="menu.set(false)">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
            <a routerLink="/ingenieurs" routerLinkActive="active">Ingénieurs</a>
            <a routerLink="/entreprises" routerLinkActive="active">Entreprises</a>
            <a routerLink="/a-propos" routerLinkActive="active">À propos</a>
            <a routerLink="/contact" routerLinkActive="active">Contact</a>
            <a routerLink="/inscription" class="cta">S'inscrire</a>
          </nav>
        </div>
      </header>
    }

    <main id="contenu" tabindex="-1"><router-outlet /></main>

    @if (!isAdmin()) {
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <a class="brand" routerLink="/" style="color:#fff"><app-logo [size]="40" [badge]="true" /> TunEngineers</a>
            <p class="foot-text">L'annuaire des ingénieurs vérifiés de Tunisie. Projet Web — Sup'Com, Groupe 8.</p>
          </div>
          <nav aria-label="Explorer">
            <h2>Explorer</h2>
            <a routerLink="/ingenieurs">Ingénieurs</a><a routerLink="/entreprises">Entreprises</a><a routerLink="/inscription">S'inscrire</a>
          </nav>
          <nav aria-label="Informations">
            <h2>Informations</h2>
            <a routerLink="/a-propos">À propos</a><a routerLink="/contact">Contact</a><a routerLink="/mentions-legales">Mentions légales</a><a routerLink="/confidentialite">Confidentialité</a>
          </nav>
        </div>
        <div class="foot-bottom"><div class="container"><span>© 2026 TunEngineers · Sup'Com</span><span>Profils de démonstration fictifs</span></div></div>
      </footer>

      @if (scrolled()) {
        <button type="button" class="to-top" aria-label="Revenir en haut de la page" (click)="top()"><app-icon name="arrow-up" [size]="20" [stroke]="2.4" /></button>
      }
    }

    <app-toasts />
  `,
})
export class App {
  private router = inject(Router);
  menu = signal(false);
  scrolled = signal(false);
  isAdmin = signal(this.router.url.startsWith('/gestion-admin'));

  constructor() {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.isAdmin.set(e.urlAfterRedirects.startsWith('/gestion-admin'));
      this.menu.set(false);
    });
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 320); }

  top() { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
}
