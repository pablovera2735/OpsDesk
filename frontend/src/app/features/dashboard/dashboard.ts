import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  User
} from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="dashboard">

      <header class="topbar">

        <div>
          <h1>OpsDesk</h1>
          <span>IT Service Management</span>
        </div>

        <div class="topbar-actions">

          <a
            routerLink="/tickets"
            class="tickets-link"
          >
            Tickets
          </a>

          <button
            class="logout-button"
            (click)="logout()"
            [disabled]="loadingLogout()"
          >
            {{ loadingLogout() ? 'Cerrando...' : 'Cerrar sesión' }}
          </button>

        </div>

      </header>

      @if (loading()) {

        <section class="loading">
          Cargando información del usuario...
        </section>

      } @else if (errorMessage()) {

        <section class="error">
          {{ errorMessage() }}
        </section>

      } @else if (user()) {

        <section class="welcome">
          <h2>Bienvenido, {{ user()!.name }}</h2>

          <p>
            Aquí tienes el resumen de tu cuenta de OpsDesk.
          </p>
        </section>

        <section class="cards">

          <article class="card">
            <span class="card-label">Usuario</span>
            <strong>{{ user()!.name }}</strong>
          </article>

          <article class="card">
            <span class="card-label">Email</span>
            <strong>{{ user()!.email }}</strong>
          </article>

          <article class="card">
            <span class="card-label">Rol</span>
            <strong>{{ user()!.role?.name }}</strong>
          </article>

          <article class="card">
            <span class="card-label">Departamento</span>
            <strong>{{ user()!.department?.name }}</strong>
          </article>

        </section>

        <section class="account">

          <h3>Información de la cuenta</h3>

          <div class="info-row">
            <span>ID</span>
            <strong>{{ user()!.id }}</strong>
          </div>

          <div class="info-row">
            <span>Email</span>
            <strong>{{ user()!.email }}</strong>
          </div>

          <div class="info-row">
            <span>Rol</span>
            <strong>{{ user()!.role?.slug }}</strong>
          </div>

          <div class="info-row">
            <span>Departamento</span>
            <strong>{{ user()!.department?.code }}</strong>
          </div>

          <div class="info-row">
            <span>Estado</span>
            <strong>
              {{ user()!.active ? 'Activo' : 'Inactivo' }}
            </strong>
          </div>

        </section>

      }

    </main>
  `,

  styles: [`
    :host {
      display: block;
    }

    .dashboard {
      min-height: 100vh;
      background: #f4f7fb;
      color: #111827;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 40px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
    }

    .topbar h1 {
      margin: 0;
      font-size: 25px;
    }

    .topbar span {
      color: #6b7280;
      font-size: 13px;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tickets-link {
      padding: 10px 16px;
      border-radius: 8px;
      background: #e5e7eb;
      color: #111827;
      text-decoration: none;
      font-size: 14px;
      cursor: pointer;
    }

    .tickets-link:hover {
      background: #d1d5db;
    }

    .logout-button {
      padding: 10px 16px;
      border: 0;
      border-radius: 8px;
      background: #111827;
      color: white;
      cursor: pointer;
    }

    .logout-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .welcome {
      padding: 40px 40px 20px;
    }

    .welcome h2 {
      margin: 0 0 8px;
      font-size: 28px;
    }

    .welcome p {
      margin: 0;
      color: #6b7280;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding: 20px 40px;
    }

    .card {
      padding: 24px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    }

    .card-label {
      display: block;
      margin-bottom: 10px;
      color: #6b7280;
      font-size: 13px;
    }

    .card strong {
      font-size: 17px;
    }

    .account {
      margin: 20px 40px 40px;
      padding: 24px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      max-width: 700px;
    }

    .account h3 {
      margin-top: 0;
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 13px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: 0;
    }

    .info-row span {
      color: #6b7280;
    }

    .loading,
    .error {
      margin: 40px;
      padding: 20px;
      background: white;
      border-radius: 12px;
    }

    .error {
      color: #b91c1c;
    }

    @media (max-width: 900px) {
      .cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {

      .topbar {
        padding: 20px;
      }

      .topbar-actions {
        gap: 8px;
      }

      .tickets-link,
      .logout-button {
        padding: 9px 12px;
        font-size: 13px;
      }

      .welcome {
        padding: 30px 20px 10px;
      }

      .cards {
        grid-template-columns: 1fr;
        padding: 20px;
      }

      .account {
        margin: 20px;
      }

    }
  `]
})
export class DashboardComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly loadingLogout = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.loadUser();
  }

  private loadUser(): void {
    this.authService.me().subscribe({
      next: (response) => {
        console.log('Usuario recibido:', response.data);

        this.user.set(response.data);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Error cargando /api/me:', error);

        this.loading.set(false);

        if (error.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
          return;
        }

        this.errorMessage.set(
          'No se ha podido cargar la información del usuario.'
        );
      }
    });
  }

  logout(): void {
    this.loadingLogout.set(true);

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },

      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }
}