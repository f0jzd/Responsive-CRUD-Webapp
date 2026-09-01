import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from './models';
import { ToastService } from './toast.service';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser() && !!this.getToken());

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  register(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, credentials).pipe(
      tap(res => {
        this.saveAuth(res);
        this.toast.success('Konto skapades framgångsrikt! Välkommen!');
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        this.saveAuth(res);
        this.toast.success('Välkommen tillbaka! Du är nu inloggad.');
      })
    );
  }

  private saveAuth(response: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.toast.info('Du har loggats ut.');
    void this.router.navigateByUrl('/login');
  }
}
