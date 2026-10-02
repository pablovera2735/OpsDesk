import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  department_id: number;
  active: boolean;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
  department?: {
    id: number;
    name: string;
    code: string;
  };
}

interface LoginResponse {
  message?: string;
  token: string;
  user?: User;
}

interface MeResponse {
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private readonly tokenKey = 'opsdesk_token';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    ).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(
      `${this.apiUrl}/me`
    );
  }

  logout(): Observable<unknown> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {}
    ).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
