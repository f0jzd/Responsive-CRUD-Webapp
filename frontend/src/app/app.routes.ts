import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'books',
    loadComponent: () => import('./features/books/book-list.component').then(m => m.BookListComponent)
  },
  {
    path: 'books/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/books/book-form.component').then(m => m.BookFormComponent)
  },
  {
    path: 'books/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/books/book-form.component').then(m => m.BookFormComponent)
  },
  {
    path: 'my-books',
    canActivate: [authGuard],
    loadComponent: () => import('./features/books/my-books.component').then(m => m.MyBooksComponent)
  },
  {
    path: 'mina-citat',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-quotes/my-quotes.component').then(m => m.MyQuotesComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'books'
  },
  {
    path: '**',
    redirectTo: 'books'
  }
];
