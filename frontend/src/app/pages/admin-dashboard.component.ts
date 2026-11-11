import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminEngineer, ApiService, Counts } from '../core/api.service';
import { AvatarComponent } from '../shared/avatar.component';
import { LogoComponent } from '../shared/logo.component';

type Statut = 'en_attente' | 'approuve' | 'refuse';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AvatarComponent, LogoComponent],
  template: `
    <div class="admin-shell">
      <div class="admin-bar">
        <div class="container">
          <span class="brand"><app-logo /> Administration - TunEngineers</span>
          <button type="button" (click)="logout()">Déconnexion</button>
        </div>
      </div>

      <div class="container page">
        <h1>Validation des profils</h1>
        <div class="tabs" role="tablist" aria-label="Filtrer par statut">
          @for (t of tabs; track t.key) {
            <button type="button" role="tab" class="chip" [attr.aria-selected]="statut() === t.key" [attr.aria-pressed]="statut() === t.key" (click)="select(t.key)">
              {{ t.label }} ({{ counts()[t.key] }})
            </button>
          }
        </div>

        @if (error()) { <p class="error-box" role="alert">{{ error() }}</p> }

        @if (rows().length === 0 && !loading()) {
          <p class="empty">Aucune demande dans cette catégorie.</p>
        } @else {
          <div class="table-wrap">
            <table>
              <caption class="sr-only">Liste des demandes d'inscription</caption>
              <thead>
                <tr><th scope="col">Photo</th><th scope="col">Nom</th><th scope="col">Domaine</th><th scope="col">LinkedIn</th><th scope="col">Justificatif</th><th scope="col">Statut</th><th scope="col">Décision</th></tr>
              </thead>
              <tbody>
                @for (r of rows(); track r.id) {
                  <tr>
                    <td><app-avatar [nom]="r.nom" [id]="r.id" [photo]="r.photo" size="sm" /></td>
                    <td><div class="who"><b>{{ r.nom }}</b><span>{{ r.email }} · {{ r.ville }}</span></div></td>
                    <td>{{ r.domaine }}<br><span class="note">{{ r.experience }}</span></td>
                    <td>
                      @if (r.linkedin) { <a class="btn btn-secondary btn-sm" [href]="r.linkedin" target="_blank" rel="noopener noreferrer">Ouvrir<span class="sr-only"> le LinkedIn de {{ r.nom }}</span></a> } @else { <span class="note">—</span> }
                    </td>
                    <td>
                      @if (r.diplome) { <a class="btn btn-secondary btn-sm" [href]="r.diplome" target="_blank" rel="noopener">Voir<span class="sr-only"> le justificatif de {{ r.nom }}</span></a> } @else { <span class="note">—</span> }
                    </td>
                    <td><span class="status" [class]="'status ' + r.statut">{{ label(r.statut) }}</span></td>
                    <td>
                      <div class="row-actions">
                        @if (r.statut !== 'approuve') { <button type="button" class="btn btn-green btn-sm" (click)="approve(r)">Approuver</button> }
                        @if (r.statut !== 'refuse') { <button type="button" class="btn btn-grey btn-sm" (click)="reject(r)">Refuser</button> }
                        <button type="button" class="btn btn-danger btn-sm" (click)="remove(r)">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        <p class="note" style="margin-top:12px">Seuls les profils approuvés deviennent publics. Vérifiez LinkedIn et diplôme avant d'approuver.</p>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  tabs: { key: Statut; label: string }[] = [
    { key: 'en_attente', label: 'En attente' },
    { key: 'approuve', label: 'Approuvés' },
    { key: 'refuse', label: 'Refusés' },
  ];
  statut = signal<Statut>('en_attente');
  rows = signal<AdminEngineer[]>([]);
  counts = signal<Counts>({ en_attente: 0, approuve: 0, refuse: 0 });
  loading = signal(true);
  error = signal('');

  ngOnInit() { this.refresh(); }

  label(s: Statut) { return s === 'en_attente' ? 'En attente' : s === 'approuve' ? 'Approuvé' : 'Refusé'; }
  select(s: Statut) { this.statut.set(s); this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.api.adminCounts().subscribe({ next: (c) => this.counts.set(c), error: (e) => this.fail(e) });
    this.api.adminList(this.statut()).subscribe({
      next: (r) => { this.rows.set(r); this.loading.set(false); },
      error: (e) => this.fail(e),
    });
  }

  private fail(e: { status: number }) {
    this.loading.set(false);
    if (e.status === 401) this.router.navigate(['/gestion-admin']);
    else this.error.set('Une erreur est survenue. Réessayez.');
  }

  approve(r: AdminEngineer) { this.api.adminApprove(r.id).subscribe({ next: () => this.refresh(), error: (e) => this.fail(e) }); }
  reject(r: AdminEngineer) { this.api.adminReject(r.id).subscribe({ next: () => this.refresh(), error: (e) => this.fail(e) }); }
  remove(r: AdminEngineer) {
    if (!confirm(`Supprimer définitivement le profil de ${r.nom} (photo et justificatif inclus) ?`)) return;
    this.api.adminDelete(r.id).subscribe({ next: () => this.refresh(), error: (e) => this.fail(e) });
  }

  logout() { this.api.adminLogout().subscribe({ complete: () => this.router.navigate(['/gestion-admin']) }); }
}
