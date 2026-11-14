# Tests — TunEngineers (Objectif 3)

Lancer le site (`npm start`, puis http://localhost:3000) et cocher chaque ligne dans **Chrome, Firefox, Edge, Safari**.

| # | Test | Chrome | Firefox | Edge | Safari |
|---|------|:--:|:--:|:--:|:--:|
| 1 | Accueil : hero, recherche, statistiques, défilement des entreprises | ☐ | ☐ | ☐ | ☐ |
| 2 | Menu : tous les liens mènent à la bonne page, page active soulignée | ☐ | ☐ | ☐ | ☐ |
| 3 | Menu mobile (< 800 px) : ouverture/fermeture | ☐ | ☐ | ☐ | ☐ |
| 4 | Annuaire : filtres domaine/ville, recherche, tri, bouton réinitialiser | ☐ | ☐ | ☐ | ☐ |
| 5 | Annuaire : clic sur une carte ouvre la fiche (modale), fermeture Échap | ☐ | ☐ | ☐ | ☐ |
| 6 | Fiche : email/téléphone visibles seulement après le clic « Contacter » | ☐ | ☐ | ☐ | ☐ |
| 7 | Entreprises : recherche, filtre par secteur, lien « Site officiel » | ☐ | ☐ | ☐ | ☐ |
| 8 | Inscription : validation des champs, aperçu photo, barre de progression | ☐ | ☐ | ☐ | ☐ |
| 9 | Inscription : envoi OK → notification, profil « en attente » | ☐ | ☐ | ☐ | ☐ |
| 10 | Contact : validation, envoi, message de confirmation | ☐ | ☐ | ☐ | ☐ |
| 11 | Contact : la carte Sup'Com s'affiche | ☐ | ☐ | ☐ | ☐ |
| 12 | Admin (`/gestion-admin`) : connexion, approuver/refuser, lire un message | ☐ | ☐ | ☐ | ☐ |
| 13 | Page inexistante : page 404 | ☐ | ☐ | ☐ | ☐ |
| 14 | Responsive : 360 px, 768 px, 1366 px sans défilement horizontal | ☐ | ☐ | ☐ | ☐ |
| 15 | Clavier : Tab visible partout, lien « Aller au contenu » | ☐ | ☐ | ☐ | ☐ |
| 16 | Vidéo de l'accueil : lecture | ☐ | ☐ | ☐ | ☐ |

## Déjà vérifié (Chromium automatisé)
- Aucune erreur JavaScript sur les 7 pages publiques ; aucun débordement horizontal à 320, 390, 768 et 1366 px.
- Sécurité : seuls les profils approuvés sont publics ; email/téléphone et diplôme jamais exposés par l'API publique.

## Remarques
Noter ici les bugs trouvés (navigateur, page, description) :
-
