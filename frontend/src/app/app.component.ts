import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './core/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="d-flex flex-column min-vh-100" style="background-color: #0d1117;">
      <app-navbar />
      <app-toast />

      <main class="flex-grow-1 py-3">
        <router-outlet />
      </main>

      <footer class="border-top py-3 text-center text-secondary small mt-auto" style="background-color: #161b22; border-color: #30363d !important;">
        <div class="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div class="text-light">
            <i class="fa-solid fa-book-open text-primary me-1"></i>
            <strong>Bokkatalog & Mina Citat</strong> &copy; 2026
          </div>
          <div>
            <span class="badge bg-dark border border-secondary text-light me-1">Angular 20</span>
            <span class="badge bg-dark border border-secondary text-light me-1">.NET 9 C#</span>
            <span class="badge bg-dark border border-secondary text-light me-1">Bootstrap 5</span>
            <span class="badge bg-dark border border-secondary text-light">Font Awesome 6</span>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class  AppComponent {}
