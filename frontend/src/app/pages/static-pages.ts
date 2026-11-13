import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { ToastService } from '../shared/toast.component';

// ===================== Contact =====================
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, IconComponent, RouterLink],
  template: `
    <header class="banner">
      <div class="container banner-in">
        <div><h1>Contact</h1><p>Une question, une demande de suppression ou de correction de profil ? Écrivez-nous, nous répondons dès que possible.</p></div>
        <img src="media/register.svg" alt="" width="260" height="195" />
      </div>
    </header>

    <div class="container page">
      <div class="contact-layout">
        <aside class="contact-info">
          <div class="card info-card"><span class="ico"><app-icon name="mail" [size]="22" /></span><div><b>Email</b><p><a href="mailto:contact&#64;tunengineers.tn">contact&#64;tunengineers.tn</a></p></div></div>
          <div class="card info-card"><span class="ico"><app-icon name="pin" [size]="22" /></span><div><b>Où ?</b><p>Sup'Com, Tunis (projet pédagogique, Groupe 8)</p></div></div>
          <div class="card info-card"><span class="ico"><app-icon name="lock" [size]="22" /></span><div><b>Vos données</b><p>Votre message n'est lu que par l'administrateur. <a routerLink="/confidentialite">Confidentialité</a></p></div></div>
        </aside>

        <section class="card form-card" style="max-width:none;margin:0" aria-labelledby="ct">
          @if (sent()) {
            <div class="success-card" role="status" style="margin:0">
              <span class="check"><app-icon name="check" [size]="28" [stroke]="3" /></span>
              <h2 id="ct">Message envoyé</h2>
              <p>Merci ! Nous vous répondrons à l'adresse indiquée dès que possible.</p>
              <button type="button" class="btn btn-secondary" (click)="again()">Envoyer un autre message</button>
            </div>
          } @else {
            <h2 id="ct">Envoyer un message</h2>
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <div class="form-grid">
                <div>
                  <label for="c-nom">Nom complet</label>
                  <input id="c-nom" class="field" formControlName="nom" autocomplete="name" />
                  @if (err('nom'); as m) { <p class="err" role="alert">{{ m }}</p> }
                </div>
                <div>
                  <label for="c-email">Email</label>
                  <input id="c-email" class="field" type="email" formControlName="email" autocomplete="email" />
                  @if (err('email'); as m) { <p class="err" role="alert">{{ m }}</p> }
                </div>
                <div class="full">
                  <label for="c-sujet">Sujet</label>
                  <select id="c-sujet" class="field" formControlName="sujet">
                    <option value="">Choisir un sujet</option>
                    @for (s of sujets(); track s) { <option [value]="s">{{ s }}</option> }
                  </select>
                  @if (err('sujet'); as m) { <p class="err" role="alert">{{ m }}</p> }
                </div>
                <div class="full">
                  <label for="c-msg">Message</label>
                  <textarea id="c-msg" class="field area" rows="6" formControlName="message" maxlength="2000"></textarea>
                  <p class="note" style="text-align:right">{{ form.controls.message.value.length }} / 2000</p>
                  @if (err('message'); as m) { <p class="err" role="alert">{{ m }}</p> }
                </div>
                <!-- Champ piège anti-robot : invisible pour les humains -->
                <div class="hp" aria-hidden="true"><label for="c-site">Ne pas remplir</label><input id="c-site" tabindex="-1" autocomplete="off" formControlName="site" /></div>
              </div>
              @if (serverError()) { <p class="error-box" role="alert" style="margin-top:14px">{{ serverError() }}</p> }
              <div class="form-foot" style="margin-top:16px">
                <span></span>
                <button type="submit" class="btn" [disabled]="sending()">{{ sending() ? 'Envoi…' : 'Envoyer' }} <app-icon name="arrow-right" [size]="16" /></button>
              </div>
            </form>
          }
        </section>
      </div>
    </div>`,
})
export class ContactComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  sujets = signal<string[]>([]);
  sending = signal(false);
  sent = signal(false);
  submitted = signal(false);
  serverError = signal('');
  serverErrs = signal<Record<string, string>>({});

  form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    sujet: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    site: [''],
  });

  private msgs: Record<string, Record<string, string>> = {
    nom: { required: 'Nom requis.', minlength: '2 caractères minimum.' },
    email: { required: 'Email requis.', email: 'Adresse email invalide.' },
    sujet: { required: 'Choisissez un sujet.' },
    message: { required: 'Écrivez votre message.', minlength: 'Message trop court (10 caractères minimum).' },
  };

  ngOnInit() {
    this.api.sujets().subscribe({ next: (s) => this.sujets.set(s), error: () => this.sujets.set(['Question générale', 'Autre']) });
    this.route();
  }
  private route() { /* préremplissage possible par la suite */ }

  err(name: 'nom' | 'email' | 'sujet' | 'message'): string {
    const s = this.serverErrs()[name];
    if (s) return s;
    const c = this.form.controls[name];
    if (!c.errors || !(c.touched || this.submitted())) return '';
    return this.msgs[name][Object.keys(c.errors)[0]] ?? 'Valeur invalide.';
  }

  submit() {
    this.submitted.set(true);
    this.serverError.set('');
    this.serverErrs.set({});
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.sending.set(true);
    this.api.sendContact(this.form.getRawValue()).subscribe({
      next: () => { this.sending.set(false); this.sent.set(true); this.toast.ok('Message envoyé. Merci !'); },
      error: (e) => {
        this.sending.set(false);
        if (e.error?.errors) this.serverErrs.set(e.error.errors);
        else this.serverError.set(e.status === 429 ? 'Trop de messages envoyés. Réessayez plus tard.' : "Une erreur est survenue. Réessayez dans un instant.");
        this.toast.error("Le message n'a pas pu être envoyé.");
      },
    });
  }

  again() { this.form.reset({ nom: '', email: '', sujet: '', message: '', site: '' }); this.submitted.set(false); this.sent.set(false); }
}

// ===================== À propos =====================
@Component({
  selector: 'app-about',
  imports: [RouterLink, IconComponent, RevealDirective],
  template: `
    <header class="banner">
      <div class="container banner-in">
        <div><h1>À propos de TunEngineers</h1><p>Une plateforme de recrutement en ligne qui réunit les ingénieurs tunisiens vérifiés et les entreprises qui les recherchent.</p></div>
        <img src="media/hero.svg" alt="" width="300" height="254" />
      </div>
    </header>

    <div class="container page">
      <section class="prose-wide" appReveal>
        <p>TunEngineers réunit, dans un annuaire, des ingénieurs tunisiens de tous les domaines dont le profil a été vérifié par un administrateur. Elle les relie à des entreprises tunisiennes de différents secteurs afin de faciliter les contacts et de faire gagner du temps aux deux parties.</p>
      </section>

      <section class="section" aria-labelledby="obj">
        <div class="section-head"><h2 id="obj">Nos objectifs</h2></div>
        <div class="features">
          <article class="feature card" appReveal><span class="ico"><app-icon name="users" [size]="24" /></span><h3>Centraliser</h3><p>Les profils d'ingénieurs de tous les domaines au même endroit.</p></article>
          <article class="feature card" [appReveal]="80"><span class="ico"><app-icon name="shield" [size]="24" /></span><h3>Vérifier</h3><p>Chaque compte est contrôlé avant toute publication.</p></article>
          <article class="feature card" [appReveal]="160"><span class="ico"><app-icon name="link" [size]="24" /></span><h3>Connecter</h3><p>Relier ingénieurs et entreprises tunisiennes.</p></article>
          <article class="feature card" [appReveal]="240"><span class="ico"><app-icon name="target" [size]="24" /></span><h3>Informer</h3><p>Sur le monde des ingénieurs et le recrutement en ligne.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="proc">
        <div class="section-head"><h2 id="proc">Le parcours d'un profil</h2></div>
        <ol class="timeline">
          <li appReveal><b>Inscription</b><span>L'ingénieur remplit le formulaire, téléverse sa photo et son diplôme (privé) et donne son consentement.</span></li>
          <li [appReveal]="80"><b>Vérification</b><span>L'administrateur contrôle le diplôme et le profil LinkedIn.</span></li>
          <li [appReveal]="160"><b>Publication</b><span>Le profil approuvé apparaît dans l'annuaire public.</span></li>
          <li [appReveal]="240"><b>Contact</b><span>Les entreprises cliquent sur « Contacter » pour obtenir l'email et le téléphone.</span></li>
        </ol>
      </section>

      <section class="final-cta" appReveal>
        <h2>Prêt à rejoindre la communauté ?</h2>
        <p>Inscrivez-vous gratuitement : votre profil sera visible après vérification.</p>
        <a class="btn btn-cyan" routerLink="/inscription">Rejoindre la communauté <app-icon name="arrow-right" [size]="16" /></a>
      </section>
    </div>`,
})
export class AboutComponent {}

// ===================== Mentions légales =====================
@Component({
  selector: 'app-legal',
  template: `
    <header class="banner slim"><div class="container"><h1>Mentions légales</h1></div></header>
    <div class="container page"><article class="card prose">
      <h2>Éditeur</h2>
      <p>TunEngineers — projet pédagogique réalisé à l'École supérieure des communications de Tunis (Sup'Com), année universitaire 2026/2027. Ce site n'a pas de vocation commerciale.</p>
      <h2>Contact</h2>
      <p><a href="mailto:contact&#64;tunengineers.tn">contact&#64;tunengineers.tn</a></p>
      <h2>Liens externes</h2>
      <p>Les liens vers les sites officiels des entreprises mènent vers des sites tiers dont TunEngineers n'est pas responsable.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les marques et noms d'entreprises cités appartiennent à leurs propriétaires respectifs. Les logos affichés pour les entreprises sont des monogrammes générés, et non leurs logos officiels. Les illustrations et la vidéo sont originales.</p>
      <h2>Profils de démonstration</h2>
      <p>Certains profils d'ingénieurs affichés à titre de démonstration sont fictifs.</p>
    </article></div>`,
})
export class LegalComponent {}

// ===================== Confidentialité =====================
@Component({
  selector: 'app-privacy',
  template: `
    <header class="banner slim"><div class="container"><h1>Confidentialité</h1></div></header>
    <div class="container page"><article class="card prose">
      <p>TunEngineers respecte la loi tunisienne sur la protection des données personnelles (loi organique n° 2004-63).</p>
      <h2>Données collectées</h2>
      <p>Nom, domaine, ville, expérience, compétences, lien LinkedIn, photo, email, téléphone (optionnel) et un diplôme ou justificatif. Les messages envoyés via la page Contact (nom, email, sujet, texte) sont conservés pour y répondre.</p>
      <h2>Ce qui est public</h2>
      <ul>
        <li>Public : nom, photo, domaine, ville, expérience, compétences, LinkedIn.</li>
        <li>Après clic sur « Contacter » : email et téléphone.</li>
        <li>Administrateur seul : diplôme / justificatif et messages de contact.</li>
      </ul>
      <h2>Consentement</h2>
      <p>La publication de votre profil repose sur votre consentement explicite, enregistré avec votre demande. Seuls les profils approuvés par l'administrateur sont publiés.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez demander la suppression de votre profil sur simple demande via la page <a href="/contact">Contact</a> ou à <a href="mailto:contact&#64;tunengineers.tn">contact&#64;tunengineers.tn</a>. Votre photo et votre justificatif sont alors effacés.</p>
      <h2>Sécurité</h2>
      <p>Validation côté serveur, fichiers limités en type et en taille, accès administrateur protégé par mot de passe haché et session, limitation du nombre de demandes.</p>
    </article></div>`,
})
export class PrivacyComponent {}

// ===================== 404 =====================
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container page"><div class="card success-card">
      <img src="media/not-found.svg" alt="" width="260" height="163" />
      <h1>Page introuvable</h1>
      <p>La page demandée n'existe pas ou a été déplacée.</p>
      <a class="btn" routerLink="/">Retour à l'accueil</a>
    </div></div>`,
})
export class NotFoundComponent {}
