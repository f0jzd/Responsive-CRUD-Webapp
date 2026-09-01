import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  if (localStorage.getItem('access_token')) return true;
  // A login component should set access_token after POST /api/auth/login.
  return inject(Router).parseUrl('/login');
};
