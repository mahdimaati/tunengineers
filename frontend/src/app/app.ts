import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LogoComponent } from './shared/logo.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <a class="skip-link" href="#contenu">Aller au contenu</a>

    @if (!isAdmin()) {
      <header class="site-header">
        <div class="container">
          <a class="brand" routerLink="/" aria-label="TunEngineers – accueil" (click)="menu.set(false)"><app-logo /> TunEngineers</a>
          <button type="button" class="burger" [attr.aria-expanded]="menu()" aria-controls="nav-principal" aria-label="Menu" (click)="menu.set(!menu())">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              @if (menu()) { <path d="M6 6l12 12M18 6 6 18"/> } @else { <path d="M4 7h16M4 12h16M4 17h16"/> }
            </svg>
          </button>
          <nav id="nav-principal" class="nav" [class.open]="menu()" aria-label="Navigation principale" (click)="menu.set(false)">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
            <a routerLink="/ingenieurs" routerLinkActive="active">Ingénieurs</a>
            <a routerLink="/entreprises" routerLinkActive="active">Entreprises</a>
            <a routerLink="/inscription" class="cta">S'inscrire</a>
          </nav>
        </div>
      </header>
    }

    <main id="contenu" tabindex="-1"><router-outlet /></main>

    @if (!isAdmin()) {
      <footer class="site-footer">
        <div class="container">
          <span>© 2026 TunEngineers · Sup'Com</span>
          <nav aria-label="Pied de page">
            <a routerLink="/contact">Contact</a>
            <a routerLink="/a-propos">À propos</a>
            <a routerLink="/mentions-legales">Mentions légales</a>
            <a routerLink="/confidentialite">Confidentialité</a>
          </nav>
        </div>
      </footer>
    }
  `,
})
export class App {
  private router = inject(Router);
  menu = signal(false);
  isAdmin = signal(this.router.url.startsWith('/gestion-admin'));

  constructor() {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.isAdmin.set(e.urlAfterRedirects.startsWith('/gestion-admin'));
      this.menu.set(false);
    });
  }
}
