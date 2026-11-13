import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminEngineer, ApiService, Counts, Message } from '../core/api.service';
import { AvatarComponent } from '../shared/avatar.component';
import { IconComponent } from '../shared/icon.component';
import { LogoComponent } from '../shared/logo.component';
import { ToastService } from '../shared/toast.component';

type Statut = 'en_attente' | 'approuve' | 'refuse';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AvatarComponent, LogoComponent, IconComponent],
  template: `
    <div class="admin-shell">
      <div class="admin-bar">
        <div class="container">
          <span class="brand"><app-logo /> Administration - TunEngineers</span>
          <button type="button" (click)="logout()">Déconnexion</button>
        </div>
      </div>

      <div class="container page">
        <div class="kpis" aria-label="Résumé">
          <div class="kpi warn"><b>{{ counts().en_attente }}</b><span>à vérifier</span></div>
          <div class="kpi ok"><b>{{ counts().approuve }}</b><span>approuvés</span></div>
          <div class="kpi"><b>{{ counts().refuse }}</b><span>refusés</span></div>
          <div class="kpi info"><b>{{ counts().messages_non_lus }}</b><span>messages non lus</span></div>
        </div>

        <div class="tabs" role="tablist" aria-label="Sections">
          <button type="button" role="tab" class="chip" [attr.aria-selected]="view() === 'profils'" [attr.aria-pressed]="view() === 'profils'" (click)="setView('profils')">Profils</button>
          <button type="button" role="tab" class="chip" [attr.aria-selected]="view() === 'messages'" [attr.aria-pressed]="view() === 'messages'" (click)="setView('messages')">
            Messages @if (counts().messages_non_lus) { <span class="dot-badge">{{ counts().messages_non_lus }}</span> }
          </button>
        </div>

        @if (error()) { <p class="error-box" role="alert">{{ error() }}</p> }

        @if (view() === 'profils') {
          <h1>Validation des profils</h1>
          <div class="tabs" role="tablist" aria-label="Filtrer par statut">
            @for (t of tabs; track t.key) {
              <button type="button" role="tab" class="chip" [attr.aria-selected]="statut() === t.key" [attr.aria-pressed]="statut() === t.key" (click)="select(t.key)">
                {{ t.label }} ({{ counts()[t.key] }})
              </button>
            }
          </div>

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
                        @if (r.diplome) { <a class="btn btn-secondary btn-sm" [href]="r.diplome" target="_blank" rel="noopener">Voir<span class="sr-only"> le justificatif de {{ r.nom }}</span></a> } @else { <span class="note">Démo</span> }
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
        } @else {
          <h1>Messages reçus</h1>
          @if (messages().length === 0) {
            <p class="empty"><app-icon name="inbox" [size]="28" /><br>Aucun message pour l'instant.</p>
          } @else {
            <ul class="msg-list">
              @for (m of messages(); track m.id) {
                <li class="card msg" [class.unread]="!m.lu">
                  <div class="msg-head">
                    <div><b>{{ m.nom }}</b> <a [href]="'mailto:' + m.email">{{ m.email }}</a></div>
                    <span class="note">{{ m.date }}</span>
                  </div>
                  <div class="msg-sub"><span class="tag" style="margin:0">{{ m.sujet }}</span> @if (!m.lu) { <span class="status en_attente">Nouveau</span> }</div>
                  <p class="msg-body">{{ m.message }}</p>
                  <div class="row-actions">
                    <a class="btn btn-secondary btn-sm" [href]="'mailto:' + m.email + '?subject=' + encode('Re: ' + m.sujet)">Répondre</a>
                    @if (!m.lu) { <button type="button" class="btn btn-green btn-sm" (click)="markRead(m)">Marquer comme lu</button> }
                    <button type="button" class="btn btn-danger btn-sm" (click)="removeMessage(m)">Supprimer</button>
                  </div>
                </li>
              }
            </ul>
          }
        }
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  tabs: { key: Statut; label: string }[] = [
    { key: 'en_attente', label: 'En attente' },
    { key: 'approuve', label: 'Approuvés' },
    { key: 'refuse', label: 'Refusés' },
  ];
  view = signal<'profils' | 'messages'>('profils');
  statut = signal<Statut>('en_attente');
  rows = signal<AdminEngineer[]>([]);
  messages = signal<Message[]>([]);
  counts = signal<Counts>({ en_attente: 0, approuve: 0, refuse: 0, messages_non_lus: 0 });
  loading = signal(true);
  error = signal('');

  ngOnInit() { this.refresh(); }

  encode = encodeURIComponent;
  label(s: Statut) { return s === 'en_attente' ? 'En attente' : s === 'approuve' ? 'Approuvé' : 'Refusé'; }
  select(s: Statut) { this.statut.set(s); this.refresh(); }
  setView(v: 'profils' | 'messages') { this.view.set(v); this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.error.set('');
    this.api.adminCounts().subscribe({ next: (c) => this.counts.set(c), error: (e) => this.fail(e) });
    if (this.view() === 'profils') {
      this.api.adminList(this.statut()).subscribe({
        next: (r) => { this.rows.set(r); this.loading.set(false); },
        error: (e) => this.fail(e),
      });
    } else {
      this.api.adminMessages().subscribe({
        next: (m) => { this.messages.set(m); this.loading.set(false); },
        error: (e) => this.fail(e),
      });
    }
  }

  private fail(e: { status: number }) {
    this.loading.set(false);
    if (e.status === 401) this.router.navigate(['/gestion-admin']);
    else { this.error.set('Une erreur est survenue. Réessayez.'); this.toast.error('Action impossible pour le moment.'); }
  }

  private done(text: string) { this.toast.ok(text); this.refresh(); }

  approve(r: AdminEngineer) { this.api.adminApprove(r.id).subscribe({ next: () => this.done(`${r.nom} approuvé : le profil est maintenant public.`), error: (e) => this.fail(e) }); }
  reject(r: AdminEngineer) { this.api.adminReject(r.id).subscribe({ next: () => this.done(`${r.nom} refusé.`), error: (e) => this.fail(e) }); }
  remove(r: AdminEngineer) {
    if (!confirm(`Supprimer définitivement le profil de ${r.nom} (photo et justificatif inclus) ?`)) return;
    this.api.adminDelete(r.id).subscribe({ next: () => this.done('Profil supprimé.'), error: (e) => this.fail(e) });
  }

  markRead(m: Message) { this.api.adminMessageRead(m.id).subscribe({ next: () => this.done('Message marqué comme lu.'), error: (e) => this.fail(e) }); }
  removeMessage(m: Message) {
    if (!confirm(`Supprimer le message de ${m.nom} ?`)) return;
    this.api.adminMessageDelete(m.id).subscribe({ next: () => this.done('Message supprimé.'), error: (e) => this.fail(e) });
  }

  logout() { this.api.adminLogout().subscribe({ complete: () => this.router.navigate(['/gestion-admin']) }); }
}
