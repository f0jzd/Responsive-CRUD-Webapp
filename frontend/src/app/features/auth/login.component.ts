import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5">
          <!-- Auth Card -->
          <div class="card shadow border rounded-4 overflow-hidden" style="background-color: #161b22; border-color: #30363d !important;">
            <!-- Header Tabs -->
            <div class="card-header p-0 border-0" style="background-color: #21262d;">
              <div class="d-flex">
                <button
                  type="button"
                  class="btn flex-fill py-3 rounded-0 fw-semibold text-white border-0"
                  [class.bg-primary]="!isRegisterMode()"
                  [class.bg-transparent]="isRegisterMode()"
                  (click)="setMode(false)"
                >
                  <i class="fa-solid fa-right-to-bracket me-1"></i> Logga in
                </button>
                <button
                  type="button"
                  class="btn flex-fill py-3 rounded-0 fw-semibold text-white border-0"
                  [class.bg-primary]="isRegisterMode()"
                  [class.bg-transparent]="!isRegisterMode()"
                  (click)="setMode(true)"
                >
                  <i class="fa-solid fa-user-plus me-1"></i> Skapa konto
                </button>
              </div>
            </div>

            <div class="card-body p-4 p-md-5" style="background-color: #161b22;">
              <div class="text-center mb-4">
                <div class="display-6 text-primary mb-2">
                  <i [class.fa-lock]="!isRegisterMode()" [class.fa-user-shield]="isRegisterMode()" class="fa-solid"></i>
                </div>
                <h1 class="h4 fw-bold text-white mb-1">
                  {{ isRegisterMode() ? 'Skapa nytt användarkonto' : 'Välkommen tillbaka' }}
                </h1>
                <p class="text-secondary small">
                  {{ isRegisterMode() ? 'Registrera dig för att lägga till böcker och hantera dina favoritcitat.' : 'Logga in för att hantera dina böcker och citat.' }}
                </p>
              </div>

              <!-- Error Alert -->
              @if (errorMessage()) {
                <div class="alert alert-danger d-flex align-items-center small py-2" role="alert">
                  <i class="fa-solid fa-circle-exclamation fs-5 me-2 flex-shrink-0"></i>
                  <div>{{ errorMessage() }}</div>
                </div>
              }

              <!-- Auth Form -->
              <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <!-- Email -->
                <div class="mb-3">
                  <label for="email" class="form-label fw-semibold text-light">E-postadress</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fa-solid fa-envelope"></i></span>
                    <input
                      id="email"
                      type="email"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('email')"
                      formControlName="email"
                      placeholder="namn@exempel.se"
                      autocomplete="email"
                    />
                  </div>
                  @if (isFieldInvalid('email')) {
                    <div class="text-danger small mt-1">
                      @if (form.get('email')?.errors?.['required']) {
                        E-postadress är obligatorisk.
                      } @else if (form.get('email')?.errors?.['email']) {
                        Ange en giltig e-postadress.
                      }
                    </div>
                  }
                </div>

                <!-- Password -->
                <div class="mb-4">
                  <label for="password" class="form-label fw-semibold text-light">Lösenord</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fa-solid fa-key"></i></span>
                    <input
                      id="password"
                      [type]="showPassword() ? 'text' : 'password'"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('password')"
                      formControlName="password"
                      placeholder="Minst 6 tecken"
                      autocomplete="current-password"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      (click)="togglePasswordVisibility()"
                      aria-label="Visa eller dölj lösenord"
                    >
                      <i class="fa-solid" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
                    </button>
                  </div>
                  @if (isFieldInvalid('password')) {
                    <div class="text-danger small mt-1">
                      @if (form.get('password')?.errors?.['required']) {
                        Lösenord är obligatoriskt.
                      } @else if (form.get('password')?.errors?.['minlength']) {
                        Lösenordet måste innehålla minst 6 tecken.
                      }
                    </div>
                  }
                </div>

                <!-- Submit Button -->
                <div class="d-grid mb-3">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg shadow-sm"
                    [disabled]="form.invalid || isSubmitting()"
                  >
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isRegisterMode() ? 'Skapar konto...' : 'Loggar in...' }}
                    } @else {
                      <i class="fa-solid me-2" [class.fa-right-to-bracket]="!isRegisterMode()" [class.fa-user-plus]="isRegisterMode()"></i>
                      {{ isRegisterMode() ? 'Registrera konto' : 'Logga in' }}
                    }
                  </button>
                </div>
              </form>

              <!-- Quick Demo Login Helper -->
              <div class="mt-4 pt-3 border-top text-center" style="border-color: #30363d !important;">
                <p class="text-secondary small mb-2">Testa direkt med förkonfigurerat demo-konto:</p>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  (click)="fillDemoCredentials()"
                >
                  <i class="fa-solid fa-wand-magic-sparkles me-1 text-warning"></i>
                  Fyll i demo-uppgifter (demo&#64;example.com)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  isRegisterMode = signal(false);
  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  ngOnInit() {
    // Check query params for mode or register flag
    this.route.queryParams.subscribe(params => {
      if (params['register'] === 'true' || params['mode'] === 'register') {
        this.isRegisterMode.set(true);
      }
    });

    // If already logged in, redirect away
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/books');
    }
  }

  setMode(register: boolean) {
    this.isRegisterMode.set(register);
    this.errorMessage.set('');
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  fillDemoCredentials() {
    this.isRegisterMode.set(false);
    this.errorMessage.set('');
    this.form.setValue({
      email: 'demo@example.com',
      password: 'Password123!'
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);
    const credentials = this.form.getRawValue();

    const request$ = this.isRegisterMode()
      ? this.auth.register(credentials)
      : this.auth.login(credentials);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/books';
        void this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.isSubmitting.set(false);
        if (err.status === 409) {
          this.errorMessage.set('E-postadressen är redan registrerad. Prova att logga in istället.');
        } else if (err.status === 401) {
          this.errorMessage.set('Fel e-postadress eller lösenord. Kontrollera dina uppgifter.');
        } else {
          this.errorMessage.set('Ett nätverksfel uppstod. Kontrollera anslutningen till servern.');
        }
      }
    });
  }
}
