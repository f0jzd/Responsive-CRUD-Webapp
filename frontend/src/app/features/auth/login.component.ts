import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `<main class="container py-5"><form class="card card-body mx-auto shadow-sm" style="max-width: 28rem" [formGroup]="form" (ngSubmit)="submit()">
    <h1 class="h3 mb-3">Logga in</h1>
    <label class="form-label">E-post</label><input class="form-control mb-2" type="email" formControlName="email">
    <label class="form-label">Lösenord</label><input class="form-control mb-3" type="password" formControlName="password">
    @if (error) { <p class="text-danger">{{ error }}</p> }
    <button class="btn btn-primary" [disabled]="form.invalid">Logga in</button>
    <button type="button" class="btn btn-link mt-2" (click)="submit(true)">Skapa konto</button>
  </form></main>`
})
export class LoginComponent {
  private http = inject(HttpClient); private router = inject(Router);
  error = '';
  form = new FormGroup({ email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }), password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }) });
  submit(register = false) {
    if (this.form.invalid) return;
    this.error = '';
    this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/${register ? 'register' : 'login'}`, this.form.getRawValue()).subscribe({
      next: result => { localStorage.setItem('access_token', result.accessToken); void this.router.navigateByUrl('/mina-citat'); },
      error: () => this.error = register ? 'Kunde inte skapa kontot. Kontrollera e-post och lösenord.' : 'Fel e-post eller lösenord.'
    });
  }
}
