import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  template: `
    <div class="container page"><article class="card prose">
      <h1>Contact</h1>
      <h2>Nous écrire</h2>
      <p>Une question, une demande de suppression de profil ou de correction de vos données ? Écrivez-nous à <a href="mailto:contact@tunengineers.tn">contact&#64;tunengineers.tn</a>. Nous répondons dès que possible.</p>
      <h2>Projet universitaire</h2>
      <p>TunEngineers est réalisé dans le cadre du module Projet Web à Sup'Com (Groupe 8).</p>
    </article></div>`,
})
export class ContactComponent {}

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  template: `
    <div class="container page"><article class="card prose">
      <h1>À propos</h1>
      <p>TunEngineers est une plateforme de recrutement en ligne qui réunit, dans un annuaire, des ingénieurs tunisiens de tous les domaines dont le profil a été vérifié par un administrateur. Elle les relie à des entreprises tunisiennes de différents secteurs afin de faciliter les contacts et de faire gagner du temps aux deux parties.</p>
      <h2>Nos objectifs</h2>
      <ul>
        <li><b>Centraliser</b> les profils d'ingénieurs de tous les domaines.</li>
        <li><b>Vérifier</b> chaque compte avant toute publication.</li>
        <li><b>Connecter</b> les ingénieurs et les entreprises tunisiennes.</li>
        <li><b>Informer</b> sur le monde des ingénieurs et le recrutement en ligne.</li>
      </ul>
      <p style="margin-top:16px"><a class="btn" routerLink="/inscription">Rejoindre la communauté</a></p>
    </article></div>`,
})
export class AboutComponent {}

@Component({
  selector: 'app-legal',
  template: `
    <div class="container page"><article class="card prose">
      <h1>Mentions légales</h1>
      <h2>Éditeur</h2>
      <p>TunEngineers — projet pédagogique réalisé à l'École supérieure des communications de Tunis (Sup'Com), année universitaire 2026/2027. Ce site n'a pas de vocation commerciale.</p>
      <h2>Contact</h2>
      <p><a href="mailto:contact@tunengineers.tn">contact&#64;tunengineers.tn</a></p>
      <h2>Liens externes</h2>
      <p>Les liens vers les sites officiels des entreprises mènent vers des sites tiers dont TunEngineers n'est pas responsable.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les marques et noms d'entreprises cités appartiennent à leurs propriétaires respectifs.</p>
    </article></div>`,
})
export class LegalComponent {}

@Component({
  selector: 'app-privacy',
  template: `
    <div class="container page"><article class="card prose">
      <h1>Confidentialité</h1>
      <p>TunEngineers respecte la loi tunisienne sur la protection des données personnelles (loi organique n° 2004-63).</p>
      <h2>Données collectées</h2>
      <p>Nom, domaine, ville, expérience, compétences, lien LinkedIn, photo, email, téléphone (optionnel) et un diplôme ou justificatif.</p>
      <h2>Ce qui est public</h2>
      <ul>
        <li>Public : nom, photo, domaine, ville, expérience, compétences, LinkedIn.</li>
        <li>Après clic sur « Contacter » : email et téléphone.</li>
        <li>Administrateur seul : diplôme / justificatif.</li>
      </ul>
      <h2>Consentement</h2>
      <p>La publication de votre profil repose sur votre consentement explicite, enregistré avec votre demande. Seuls les profils approuvés par l'administrateur sont publiés.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez demander la suppression de votre profil sur simple demande à <a href="mailto:contact@tunengineers.tn">contact&#64;tunengineers.tn</a>. Votre photo et votre justificatif sont alors effacés.</p>
      <h2>Sécurité</h2>
      <p>Validation côté serveur, fichiers limités en type et en taille, accès administrateur protégé par mot de passe haché et session.</p>
    </article></div>`,
})
export class PrivacyComponent {}

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container page"><div class="card success-card">
      <h1>Page introuvable</h1>
      <p>La page demandée n'existe pas ou a été déplacée.</p>
      <a class="btn" routerLink="/">Retour à l'accueil</a>
    </div></div>`,
})
export class NotFoundComponent {}
