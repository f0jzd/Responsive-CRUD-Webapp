import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'mina-citat', canActivate: [authGuard], loadComponent: () => import('./features/my-quotes/my-quotes.component').then(m => m.MyQuotesComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'mina-citat' },
  { path: '**', redirectTo: 'mina-citat' }
];
