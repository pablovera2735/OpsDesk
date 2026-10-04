import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';


/*
 * ============================================================
 * CATEGORÍA
 * ============================================================
 */

export interface TicketCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
}


/*
 * ============================================================
 * USUARIO
 * ============================================================
 */

export interface TicketUser {
  id: number;
  name: string;
  email: string;
}


/*
 * ============================================================
 * ACTIVO
 * ============================================================
 */

export interface TicketAsset {
  id: number;
  asset_code: string;
  hostname: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  operating_system?: string;
  ip_address?: string;
  mac_address?: string;
  status: string;
}


/*
 * ============================================================
 * COMENTARIO
 * ============================================================
 */

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  internal: boolean;
  created_at: string;
  updated_at: string;

  user?: TicketUser;
}


/*
 * ============================================================
 * HISTORIAL
 * ============================================================
 */

export interface TicketHistory {
  id: number;
  ticket_id: number;

  user_id: number | null;

  action: string;

  field: string | null;

  old_value: string | null;

  new_value: string | null;

  created_at: string;
  updated_at: string;

  user?: TicketUser | null;
}


/*
 * ============================================================
 * TICKET
 * ============================================================
 */

export interface Ticket {

  id: number;

  code: string;

  title: string;

  description: string;

  priority:
    | 'low'
    | 'medium'
    | 'high'
    | 'critical';

  status:
    | 'open'
    | 'in_progress'
    | 'resolved'
    | 'closed';

  category_id: number;

  created_by: number;

  assigned_to: number | null;

  asset_id: number | null;

  assigned_at: string | null;

  resolved_at: string | null;

  closed_at: string | null;

  created_at: string;

  updated_at: string;

  category?: TicketCategory;

  creator?: TicketUser;

  assigned_technician?: TicketUser | null;

  asset?: TicketAsset | null;

  comments?: TicketComment[];

  history?: TicketHistory[];
}


/*
 * ============================================================
 * CREAR TICKET
 * ============================================================
 */

export interface CreateTicketPayload {

  title: string;

  description: string;

  priority:
    | 'low'
    | 'medium'
    | 'high'
    | 'critical';

  category_id: number;

  assigned_to?: number | null;

  asset_id?: number | null;
}


/*
 * ============================================================
 * EDITAR TICKET
 * ============================================================
 */

export interface UpdateTicketPayload {

  title?: string;

  description?: string;

  priority?:
    | 'low'
    | 'medium'
    | 'high'
    | 'critical';

  status?:
    | 'open'
    | 'in_progress'
    | 'resolved'
    | 'closed';

  category_id?: number;

  assigned_to?: number | null;

  asset_id?: number | null;
}


/*
 * ============================================================
 * CREAR COMENTARIO
 * ============================================================
 */

export interface CreateTicketCommentPayload {

  message: string;

  internal?: boolean;
}


/*
 * ============================================================
 * RESPUESTA LISTADO
 * ============================================================
 */

export interface TicketListResponse {

  current_page: number;

  data: Ticket[];

  first_page_url: string;

  from: number | null;

  last_page: number;

  last_page_url: string;

  links: unknown[];

  next_page_url: string | null;

  path: string;

  per_page: number;

  prev_page_url: string | null;

  to: number | null;

  total: number;
}


/*
 * ============================================================
 * SERVICIO
 * ============================================================
 */

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private readonly http =
    inject(HttpClient);


  private readonly apiUrl =
    'http://127.0.0.1:8000/api/tickets';


  /*
   * ==========================================================
   * LISTAR
   * ==========================================================
   */

  getTickets(filters?: {

    status?: string;

    priority?: string;

    category_id?: number;

    assigned_to?: number;

    page?: number;

  }): Observable<TicketListResponse> {

    let params =
      new HttpParams();


    if (filters?.status) {

      params =
        params.set(
          'status',
          filters.status
        );

    }


    if (filters?.priority) {

      params =
        params.set(
          'priority',
          filters.priority
        );

    }


    if (
      filters?.category_id !== undefined
    ) {

      params =
        params.set(
          'category_id',
          filters.category_id.toString()
        );

    }


    if (
      filters?.assigned_to !== undefined
    ) {

      params =
        params.set(
          'assigned_to',
          filters.assigned_to.toString()
        );

    }


    if (
      filters?.page !== undefined
    ) {

      params =
        params.set(
          'page',
          filters.page.toString()
        );

    }


    return this.http.get<TicketListResponse>(
      this.apiUrl,
      {
        params
      }
    );
  }


  /*
   * ==========================================================
   * DETALLE
   * ==========================================================
   */

  getTicket(
    id: number
  ): Observable<{ data: Ticket }> {

    return this.http.get<{ data: Ticket }>(
      `${this.apiUrl}/${id}`
    );
  }


  /*
   * ==========================================================
   * CREAR
   * ==========================================================
   */

  createTicket(
    payload: CreateTicketPayload
  ): Observable<{ data: Ticket }> {

    return this.http.post<{ data: Ticket }>(
      this.apiUrl,
      payload
    );
  }


  /*
   * ==========================================================
   * EDITAR
   * ==========================================================
   */

  updateTicket(
    id: number,
    payload: UpdateTicketPayload
  ): Observable<{ data: Ticket }> {

    return this.http.patch<{ data: Ticket }>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }


  /*
   * ==========================================================
   * AÑADIR COMENTARIO
   * ==========================================================
   *
   * POST /api/tickets/{ticket}/comments
   */

  addComment(
    ticketId: number,
    payload: CreateTicketCommentPayload
  ): Observable<{
    message: string;
    data: TicketComment;
  }> {

    return this.http.post<{
      message: string;
      data: TicketComment;
    }>(
      `${this.apiUrl}/${ticketId}/comments`,
      payload
    );
  }

}