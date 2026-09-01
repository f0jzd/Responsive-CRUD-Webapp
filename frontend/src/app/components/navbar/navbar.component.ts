import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center fw-bold" routerLink="/books" (click)="closeMenu()">
          <i class="fa-solid fa-book-open-reader text-warning me-2 fs-4"></i>
          <span>Bok & Citat</span>
        </a>

        <button
          class="navbar-toggler"
          type="button"
          (click)="toggleMenu()"
          [attr.aria-expanded]="!isMenuCollapsed()"
          aria-label="Växla navigering"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" [class.show]="!isMenuCollapsed()">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/books"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }"
                (click)="closeMenu()"
              >
                <i class="fa-solid fa-book me-1"></i> Böcker
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/mina-citat"
                routerLinkActive="active"
                (click)="closeMenu()"
              >
                <i class="fa-solid fa-quote-left me-1"></i> Mina citat
              </a>
            </li>
          </ul>

          <div class="d-flex align-items-lg-center flex-column flex-lg-row gap-2 mt-2 mt-lg-0">
            @if (auth.isAuthenticated()) {
              <div class="text-light d-flex align-items-center me-lg-2">
                <i class="fa-solid fa-circle-user fs-5 text-info me-2"></i>
                <span class="small text-white-50">{{ auth.currentUser()?.email }}</span>
              </div>
              <button class="btn btn-outline-danger btn-sm" (click)="logout()">
                <i class="fa-solid fa-right-from-bracket me-1"></i> Logga ut
              </button>
            } @else {
              <a class="btn btn-outline-light btn-sm" routerLink="/login" (click)="closeMenu()">
                <i class="fa-solid fa-right-to-bracket me-1"></i> Logga in
              </a>
              <a
                class="btn btn-warning btn-sm text-dark fw-semibold"
                routerLink="/login"
                [queryParams]="{ register: true }"
                (click)="closeMenu()"
              >
                <i class="fa-solid fa-user-plus me-1"></i> Skapa konto
              </a>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  isMenuCollapsed = signal(true);

  toggleMenu() {
    this.isMenuCollapsed.update(v => !v);
  }

  closeMenu() {
    this.isMenuCollapsed.set(true);
  }

  logout() {
    this.closeMenu();
    this.auth.logout();
  }
}
