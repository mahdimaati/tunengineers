import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', title: 'TunEngineers – Ingénieurs vérifiés en Tunisie', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
  { path: 'ingenieurs', title: 'Annuaire des ingénieurs – TunEngineers', loadComponent: () => import('./pages/engineers.component').then((m) => m.EngineersComponent) },
  { path: 'ingenieurs/:id', title: 'Fiche ingénieur – TunEngineers', loadComponent: () => import('./pages/engineers.component').then((m) => m.EngineersComponent) },
  { path: 'entreprises', title: 'Entreprises qui recrutent – TunEngineers', loadComponent: () => import('./pages/companies.component').then((m) => m.CompaniesComponent) },
  { path: 'inscription', title: 'Rejoindre la communauté – TunEngineers', loadComponent: () => import('./pages/register.component').then((m) => m.RegisterComponent) },

  // Espace admin : URL non listée dans le menu public
  { path: 'gestion-admin', title: 'Espace administrateur', loadComponent: () => import('./pages/admin-login.component').then((m) => m.AdminLoginComponent) },
  { path: 'gestion-admin/tableau', title: 'Administration – TunEngineers', canActivate: [adminGuard], loadComponent: () => import('./pages/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },

  { path: 'contact', title: 'Contact – TunEngineers', loadComponent: () => import('./pages/static-pages').then((m) => m.ContactComponent) },
  { path: 'a-propos', title: 'À propos – TunEngineers', loadComponent: () => import('./pages/static-pages').then((m) => m.AboutComponent) },
  { path: 'mentions-legales', title: 'Mentions légales – TunEngineers', loadComponent: () => import('./pages/static-pages').then((m) => m.LegalComponent) },
  { path: 'confidentialite', title: 'Confidentialité – TunEngineers', loadComponent: () => import('./pages/static-pages').then((m) => m.PrivacyComponent) },
  { path: '**', title: 'Page introuvable – TunEngineers', loadComponent: () => import('./pages/static-pages').then((m) => m.NotFoundComponent) },
];
