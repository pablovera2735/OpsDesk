import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';

import { TicketListComponent } from './features/tickets/ticket-list/ticket-list';
import { TicketDetailComponent } from './features/tickets/ticket-detail/ticket-detail';
import { TicketCreateComponent } from './features/tickets/ticket-create/ticket-create';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  /*
   * NUEVO TICKET
   *
   * IMPORTANTE:
   * Esta ruta tiene que estar antes de /tickets/:id
   * para que "new" no se interprete como un ID.
   */
  {
    path: 'tickets/new',
    component: TicketCreateComponent,
    canActivate: [authGuard]
  },

  /*
   * DETALLE DE TICKET
   */
  {
    path: 'tickets/:id',
    component: TicketDetailComponent,
    canActivate: [authGuard]
  },

  /*
   * LISTADO DE TICKETS
   */
  {
    path: 'tickets',
    component: TicketListComponent,
    canActivate: [authGuard]
  },

  /*
   * CUALQUIER RUTA DESCONOCIDA
   */
  {
    path: '**',
    redirectTo: 'dashboard'
  }

];