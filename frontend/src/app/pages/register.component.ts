import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';

const VILLES = ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Sfax', 'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'];
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DIPLOME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX = 5 * 1024 * 1024;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container page">
      @if (done()) {
        <section class="card success-card" role="status">
          <span class="check" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
          <h1>Demande envoyée</h1>
          <p>Votre profil est <b>en attente de vérification</b>. Un administrateur contrôle votre diplôme et votre profil LinkedIn avant toute publication.</p>
          <a class="btn" routerLink="/">Retour à l'accueil</a>
        </section>
      } @else {
        <section class="card form-card" aria-labelledby="titre">
          <h1 id="titre">Rejoindre la communauté</h1>
          <p class="note" style="font-size:14px;margin-top:4px">Un administrateur vérifie chaque profil avant publication.</p>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="form-grid">
              <div>
                <label for="nom">Nom complet</label>
                <input id="nom" class="field" formControlName="nom" placeholder="Prénom Nom" autocomplete="name" />
                @if (err('nom'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>
              <div>
                <label for="email">Email professionnel / universitaire</label>
                <input id="email" class="field" type="email" formControlName="email" placeholder="prenom@exemple.tn" autocomplete="email" />
                @if (err('email'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>

              <div>
                <label for="domaine">Domaine d'ingénierie</label>
                <select id="domaine" class="field" formControlName="domaine">
                  <option value="">Choisir un domaine</option>
                  @for (d of domaines(); track d) { <option [value]="d">{{ d }}</option> }
                </select>
                @if (err('domaine'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>
              <div>
                <label for="ville">Ville</label>
                <input id="ville" class="field" formControlName="ville" list="villes" placeholder="Tunis" autocomplete="address-level2" />
                <datalist id="villes">@for (v of villes; track v) { <option [value]="v"></option> }</datalist>
                @if (err('ville'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>

              <div>
                <label for="experience">Niveau d'expérience</label>
                <select id="experience" class="field" formControlName="experience">
                  <option value="">Choisir un niveau</option>
                  @for (x of experiences(); track x) { <option [value]="x">{{ x }}</option> }
                </select>
                @if (err('experience'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>
              <div>
                <label for="competences">Compétences</label>
                <input id="competences" class="field" formControlName="competences" placeholder="Python, AutoCAD, SCADA…" />
                @if (err('competences'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>

              <div>
                <label for="linkedin">Profil LinkedIn</label>
                <input id="linkedin" class="field" type="url" formControlName="linkedin" placeholder="https://www.linkedin.com/in/…" />
                @if (err('linkedin'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>
              <div>
                <label for="telephone">Téléphone (optionnel)</label>
                <input id="telephone" class="field" type="tel" formControlName="telephone" placeholder="+216 20 000 000" autocomplete="tel" />
                @if (err('telephone'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>

              <div>
                <span class="lbl" id="lbl-photo">Photo</span>
                <label class="upload">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"/></svg>
                  <span>{{ photo()?.name || 'Téléverser une photo' }}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" aria-labelledby="lbl-photo" (change)="onFile($event, 'photo')" />
                </label>
                @if (fileErr()['photo']; as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>
              <div>
                <span class="lbl" id="lbl-dip">Diplôme / preuve</span>
                <label class="upload">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"/></svg>
                  <span>{{ diplome()?.name || 'Téléverser le diplôme ou une preuve' }}</span>
                  <span class="priv">Privé · admin seul</span>
                  <input type="file" accept="application/pdf,image/jpeg,image/png" aria-labelledby="lbl-dip" (change)="onFile($event, 'diplome')" />
                </label>
                @if (fileErr()['diplome']; as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>

              <div class="full">
                <label class="consent" for="consentement" style="font-weight:400;font-size:14px;margin:0">
                  <input id="consentement" type="checkbox" formControlName="consentement" />
                  J'accepte que mes informations soient publiées
                </label>
                @if (err('consentement'); as m) { <p class="err" role="alert">{{ m }}</p> }
              </div>
            </div>

            @if (globalError()) { <p class="error-box" role="alert" style="margin-top:16px">{{ globalError() }}</p> }

            <div class="form-foot" style="margin-top:18px">
              <p class="note">Votre diplôme n'est visible que de l'administrateur. Vous pouvez demander la suppression de votre profil à tout moment (voir <a routerLink="/confidentialite">Confidentialité</a>).</p>
              <button type="submit" class="btn" [disabled]="sending()">{{ sending() ? 'Envoi…' : 'Envoyer ma demande' }}</button>
            </div>
          </form>
        </section>
      }
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  villes = VILLES;
  domaines = signal<string[]>([]);
  experiences = signal<string[]>([]);
  photo = signal<File | null>(null);
  diplome = signal<File | null>(null);
  fileErr = signal<Record<string, string>>({});
  serverErr = signal<Record<string, string>>({});
  globalError = signal('');
  sending = signal(false);
  done = signal(false);
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    domaine: ['', Validators.required],
    ville: ['', [Validators.required, Validators.minLength(2)]],
    experience: ['', Validators.required],
    competences: ['', [Validators.required, Validators.minLength(2)]],
    linkedin: ['', Validators.pattern(/^$|^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/\S+$/i)],
    telephone: ['', Validators.pattern(/^$|^\+?[0-9 ]{8,16}$/)],
    consentement: [false, Validators.requiredTrue],
  });

  ngOnInit() {
    this.api.meta().subscribe((m) => { this.domaines.set(m.domaines); this.experiences.set(m.experiences); });
  }

  private messages: Record<string, Record<string, string>> = {
    nom: { required: 'Nom complet requis.', minlength: '2 caractères minimum.' },
    email: { required: 'Email requis.', email: 'Adresse email invalide.' },
    domaine: { required: "Choisissez un domaine d'ingénierie." },
    ville: { required: 'Ville requise.', minlength: 'Ville invalide.' },
    experience: { required: "Choisissez un niveau d'expérience." },
    competences: { required: 'Indiquez au moins une compétence.', minlength: 'Indiquez au moins une compétence.' },
    linkedin: { pattern: 'Lien LinkedIn invalide (https://www.linkedin.com/in/…).' },
    telephone: { pattern: 'Numéro de téléphone invalide.' },
    consentement: { required: 'Votre consentement à la publication est obligatoire.' },
  };

  /** Message d'erreur d'un champ (client puis serveur), affiché après soumission ou interaction. */
  err(name: string): string {
    const s = this.serverErr()[name];
    if (s) return s;
    const c = this.form.get(name);
    if (!c || !c.errors || !(c.touched || this.submitted())) return '';
    const key = Object.keys(c.errors)[0];
    return this.messages[name]?.[key === 'requiredTrue' ? 'required' : key] ?? 'Valeur invalide.';
  }

  onFile(ev: Event, kind: 'photo' | 'diplome') {
    const f = (ev.target as HTMLInputElement).files?.[0] ?? null;
    const errs = { ...this.fileErr() };
    delete errs[kind];
    const allowed = kind === 'photo' ? PHOTO_TYPES : DIPLOME_TYPES;
    if (f && !allowed.includes(f.type)) {
      errs[kind] = kind === 'photo' ? 'Photo : JPG, PNG ou WebP uniquement.' : 'Justificatif : PDF, JPG ou PNG uniquement.';
      this.setFile(kind, null);
    } else if (f && f.size > MAX) {
      errs[kind] = 'Fichier trop volumineux (5 Mo maximum).';
      this.setFile(kind, null);
    } else {
      this.setFile(kind, f);
    }
    this.fileErr.set(errs);
  }

  private setFile(kind: 'photo' | 'diplome', f: File | null) { (kind === 'photo' ? this.photo : this.diplome).set(f); }

  submit() {
    this.submitted.set(true);
    this.globalError.set('');
    this.serverErr.set({});
    const errs = { ...this.fileErr() };
    if (!this.diplome() && !errs['diplome']) errs['diplome'] = "Diplôme ou preuve requis (visible de l'administrateur uniquement).";
    this.fileErr.set(errs);

    if (this.form.invalid || Object.keys(errs).length) {
      this.form.markAllAsTouched();
      document.querySelector<HTMLElement>('.err')?.scrollIntoView({ block: 'center' });
      return;
    }

    const v = this.form.getRawValue();
    const fd = new FormData();
    (['nom', 'email', 'domaine', 'ville', 'experience', 'competences', 'linkedin', 'telephone'] as const).forEach((k) => fd.append(k, v[k]));
    fd.append('consentement', String(v.consentement));
    const p = this.photo(); if (p) fd.append('photo', p);
    fd.append('diplome', this.diplome()!);

    this.sending.set(true);
    this.api.register(fd).subscribe({
      next: () => { this.sending.set(false); this.done.set(true); },
      error: (e) => {
        this.sending.set(false);
        const body = e.error?.errors ?? null;
        if (body) {
          const { photo, diplome, fichier, ...rest } = body as Record<string, string>;
          this.serverErr.set(rest);
          this.fileErr.set({ ...(photo ? { photo } : {}), ...(diplome || fichier ? { diplome: diplome || fichier } : {}) });
        } else {
          this.globalError.set(e.status === 429 ? "Trop d'inscriptions depuis cette adresse. Réessayez plus tard." : "Une erreur est survenue. Réessayez dans un instant.");
        }
      },
    });
  }
}
