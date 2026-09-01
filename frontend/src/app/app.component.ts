import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './core/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="d-flex flex-column min-vh-100 bg-light">
      <app-navbar />
      <app-toast />

      <main class="flex-grow-1 py-3">
        <router-outlet />
      </main>

      <footer class="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div class="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div>
            <i class="fa-solid fa-book-open text-primary me-1"></i>
            <strong>Bokkatalog & Mina Citat</strong> &copy; 2026
          </div>
          <div>
            <span class="badge bg-light text-secondary border me-1">Angular 20</span>
            <span class="badge bg-light text-secondary border me-1">.NET 9 C#</span>
            <span class="badge bg-light text-secondary border me-1">Bootstrap 5</span>
            <span class="badge bg-light text-secondary border">Font Awesome 6</span>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {}
