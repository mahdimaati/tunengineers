# TunEngineers

Plateforme de recrutement en ligne d'ingénieurs vérifiés en Tunisie — Sup'Com, Projet Web (Objectif 03 : projet final).
Frontend **Angular** · Backend **Node.js + Express** · Base **SQLite** via `node:sqlite` intégré, sans compilation (2 tables : `engineers`, `companies`).

## Choix techniques

| Couche | Choix | Pourquoi |
|---|---|---|
| Frontend | **Angular** (TypeScript) | Imposé par le cours ; adapté à une application à plusieurs vues et formulaires : composants, routage, formulaires réactifs, signals pour l'état |
| Backend | **Node.js + Express** | Même écosystème JS/TS ; API REST consommée par Angular (`HttpClient`) |
| Base de données | **SQLite** (`node:sqlite`) | Un seul fichier, gratuit, sans serveur ni compilation ; évolution possible vers PostgreSQL |
| Style | CSS3 (Flexbox, Grid), Poppins | Design responsive mobile-first, fidèle aux maquettes de l'Objectif 2 |
| Outils | Git/GitHub, Angular CLI, Figma, draw.io | Versionnement, génération du projet, maquettes et sitemap |

## Fonctionnalités développées

Annuaire d'ingénieurs vérifiés (recherche + filtres), fiche détaillée, contact au clic, liste d'entreprises par secteur, inscription avec consentement et justificatif privé, espace admin sécurisé (approuver / refuser / supprimer), pages légales.

## Organisation Git

Branche `main` stable ; une branche par fonctionnalité (`feature/backend-api`, `feature/frontend`, `docs/readme`) fusionnée dans `main`.

## Lancer le projet

Prérequis : Node.js 22.13 ou plus (SQLite intégré, aucun outil de compilation nécessaire).

```bash
npm run install:all     # installe backend + frontend
npm run build           # compile Angular dans frontend/dist
npm start               # http://localhost:3000 (API + site)
```

Mode développement (rechargement automatique), dans deux terminaux :

```bash
npm run dev:api         # API sur :3000
npm run dev:web         # Angular sur :4200 (proxy /api et /uploads vers :3000)
```

## Espace administrateur

URL non listée dans le menu public : **/gestion-admin**
Identifiants par défaut (développement) : `admin` / `Admin@2026`.
En production, définissez : `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NODE_ENV=production` (cookie `secure`, derrière HTTPS).
Le mot de passe est haché avec bcrypt ; la session expire après 2 h.

`SEED_DEMO=0` désactive les profils de démonstration (fictifs) au premier lancement. Les 18 entreprises (liens officiels) sont toujours insérées.

## Pages

| Route | Contenu |
|---|---|
| `/` | Accueil : bandeau, chiffres clés réels, 3 étapes, derniers profils approuvés |
| `/ingenieurs` · `/ingenieurs/:id` | Annuaire (recherche, domaine, ville) + fiche détaillée au clic, bouton Contacter |
| `/entreprises` | Entreprises tunisiennes filtrables par secteur, lien « Site officiel » |
| `/inscription` | Formulaire (validation client + serveur, photo, diplôme privé, consentement) |
| `/gestion-admin` → `/tableau` | Connexion puis validation : Approuver / Refuser / Supprimer, consultation du justificatif |
| `/contact` | Formulaire de contact (messages visibles dans l'admin) |
| `/a-propos` `/mentions-legales` `/confidentialite` | Pied de page |

## Données et images

- **49 entreprises** réelles (9 secteurs : Télécoms, Informatique, Industrie, Énergie, Automobile, Aéronautique, Transport, BTP, Chimie) et **57 profils d'ingénieurs fictifs** de démonstration (`SEED_DEMO=0` pour ne pas les créer). Les données sont dans `backend/seed-data.js` ; elles sont ajoutées sans doublons au démarrage.
- **Logos** : `backend/public/logos/<nom>.svg` — monogrammes originaux générés par `node backend/scripts/generate-assets.js`. Ce ne sont pas les logos officiels : pour utiliser un vrai logo, déposez un fichier du même nom (ex. `vermeg.png`) dans ce dossier ; le serveur préfère automatiquement `png`, `webp` ou `jpg` au `svg`.
- **Photos de démonstration** : `backend/public/avatars/` (illustrations originales). Les photos téléversées par les vrais inscrits sont stockées à part dans `backend/uploads/photos/`.

## Interface enrichie (accueil et pages)

- **Accueil** : recherche rapide dans le bandeau, chiffres clés animés, défilement de logos d'entreprises, tuiles par domaine (avec nombre de profils, liées à l'annuaire filtré), étapes, atouts, **vidéo de présentation**, derniers profils, bandeau entreprises, FAQ, appel à l'action.
- **Annuaire** : bandeau, filtres conservés dans l'URL (lien partageable, retour depuis une fiche), tri (récents / nom / expérience), bouton « Réinitialiser », squelettes de chargement.
- **Entreprises** : recherche instantanée + filtre par secteur. **Inscription** : colonne d'arguments, aperçu de la photo choisie. **À propos** : objectifs et parcours d'un profil. **Contact** : formulaire réel (validation, champ anti-robot, 5 messages/heure/adresse).
- **Admin** : indicateurs, onglet **Messages** (répondre, marquer comme lu, supprimer), notifications de confirmation.
- Notifications (toasts), bouton « retour en haut », animations discrètes désactivées si le système demande de réduire les animations.

## Images et vidéo

Les médias sont dans `frontend/public/media/` :
- `hero.svg`, `companies.svg`, `register.svg`, `not-found.svg`, `pattern.svg` : illustrations originales.
- `promo.mp4` / `promo.webm` (17 s, sans son) + `promo-poster.jpg` : vidéo de présentation originale, réalisée à partir d'une animation aux couleurs du site.
- Pour utiliser **votre propre vidéo**, remplacez `promo.mp4` (et `promo.webm`, ou supprimez la ligne `<source ... webm>` de `home.component.ts`) en gardant les mêmes noms, puis relancez `npm run build`.

## Sécurité et données (conformément à l'Objectif 2)

- L'API publique ne renvoie que les profils `approuve` et uniquement les champs publics.
- Email et téléphone : jamais dans la liste ; renvoyés seulement par `POST /api/engineers/:id/contact` (clic « Contacter », limité en fréquence).
- Diplôme / preuve : stocké hors du dossier public, accessible uniquement à l'admin connecté.
- Consentement obligatoire, enregistré avec le profil ; suppression d'un profil (photo + justificatif effacés) par l'admin.
- Validation côté serveur ; photos JPG/PNG/WebP et justificatifs PDF/JPG/PNG, 5 Mo max ; noms de fichiers aléatoires.
- Helmet (CSP), limitation de débit (connexion, inscription, contact), cookie de session `httpOnly` + `sameSite=strict`.

## Design (charte Objectif 2)

Poppins (400/500/700), bleu minuit `#0B1437`, indigo `#4F46E5`, cyan `#22D3EE`, vert validation `#047857`, gris perle `#F5F7FF`, anthracite `#0F172A` ; cartes arrondies 8 px ; badge « Vérifié » = icône + texte ; boutons ≥ 44 px ; focus visible, navigation clavier, lien d'évitement ; mobile-first : 1 colonne (< 600 px), 2 (600–1024 px), 4 (> 1024 px), menu burger sur mobile.

## Structure

```
backend/   server.js (API) · db.js (schéma + données de départ)
frontend/  src/app/{core,shared,pages}  src/styles.css (charte)
```
