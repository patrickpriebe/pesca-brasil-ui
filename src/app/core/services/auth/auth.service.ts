import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyRequest,
} from '../../models/api-models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  private logado$ = new BehaviorSubject<boolean>(!!localStorage.getItem('pescabrasil_token'));

  isLoggedIn$ = this.logado$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('pescabrasil_token', response.token);
        localStorage.setItem('pescabrasil_nome', response.name);
        localStorage.setItem('pescabrasil_role', response.role);

        this.logado$.next(true);
      }),
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, { responseType: 'text' });
  }

  limparSessao(): void {
    localStorage.removeItem('pescabrasil_token');
    localStorage.removeItem('pescabrasil_nome');
    localStorage.removeItem('pescabrasil_role');

    this.logado$.next(false);
  }

  logout(): void {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('pescabrasil_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  verify(data: VerifyRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, data, { responseType: 'text' });
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, data, { responseType: 'text' });
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data, { responseType: 'text' });
  }

  getUserName(): string {
    return localStorage.getItem('pescabrasil_nome') || 'Pescador(a)';
  }

  isAdmin(): boolean {
    return localStorage.getItem('pescabrasil_role') === 'ROLE_ADMIN';
  }
}
