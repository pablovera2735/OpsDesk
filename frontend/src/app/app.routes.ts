import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { DashboardComponent } from './features/dashboard/dashboard';

import { TicketListComponent } from './features/tickets/ticket-list/ticket-list';
import { TicketDetailComponent } from './features/tickets/ticket-detail/ticket-detail';
import { TicketCreateComponent } from './features/tickets/ticket-create/ticket-create';
import { TicketEditComponent } from './features/tickets/ticket-edit/ticket-edit';

import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [

  /*
   * RUTA INICIAL
   */
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },


  /*
   * LOGIN
   */
  {
    path: 'login',
    component: LoginComponent
  },


  /*
   * DASHBOARD
   */
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },


  /*
   * CREAR NUEVO TICKET
   *
   * Tiene que estar antes de tickets/:id
   * para que "new" no se interprete como un ID.
   */
  {
    path: 'tickets/new',
    component: TicketCreateComponent,
    canActivate: [authGuard]
  },


  /*
   * EDITAR TICKET
   *
   * Ejemplo:
   * /tickets/10/edit
   *
   * Tiene que estar antes de tickets/:id
   */
  {
    path: 'tickets/:id/edit',
    component: TicketEditComponent,
    canActivate: [authGuard]
  },


  /*
   * DETALLE DE TICKET
   *
   * Ejemplo:
   * /tickets/10
   */
  {
    path: 'tickets/:id',
    component: TicketDetailComponent,
    canActivate: [authGuard]
  },


  /*
   * LISTADO DE TICKETS
   *
   * Ejemplo:
   * /tickets
   */
  {
    path: 'tickets',
    component: TicketListComponent,
    canActivate: [authGuard]
  },


  /*
   * CUALQUIER RUTA QUE NO EXISTA
   */
  {
    path: '**',
    redirectTo: 'dashboard'
  }

];