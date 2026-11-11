import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from './api.service';

/** Protège le tableau de bord : redirige vers la connexion si la session n'est pas valide. */
export const adminGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  return api.adminMe().pipe(
    map((r) => (r.admin ? true : router.createUrlTree(['/gestion-admin']))),
    catchError(() => of(router.createUrlTree(['/gestion-admin']))),
  );
};
