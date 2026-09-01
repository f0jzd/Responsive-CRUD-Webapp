import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.isAuthenticated()) {
    return true;
  }

  toast.warning('Du behöver logga in för att komma åt denna sida.');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
