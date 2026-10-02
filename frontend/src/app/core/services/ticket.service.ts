import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable, map } from 'rxjs';


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

  asset_id?: number | null;

}


/*
 * ============================================================
 * EDITAR TICKET
 * ============================================================
 */

export interface UpdateTicketPayload {

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

  asset_id?: number | null;

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

  private readonly http = inject(HttpClient);


  /*
   * URL BASE
   */

  private readonly apiBaseUrl =
    'http://127.0.0.1:8000/api';


  /*
   * URL TICKETS
   */

  private readonly apiUrl =
    `${this.apiBaseUrl}/tickets`;


  /*
   * ==========================================================
   * LISTAR TICKETS
   * ==========================================================
   */

  getTickets(filters?: {

    status?: string;

    priority?: string;

    category_id?: number;

    assigned_to?: number;

    page?: number;

  }): Observable<TicketListResponse> {

    let params = new HttpParams();


    if (filters?.status) {

      params = params.set(
        'status',
        filters.status
      );

    }


    if (filters?.priority) {

      params = params.set(
        'priority',
        filters.priority
      );

    }


    if (filters?.category_id !== undefined) {

      params = params.set(
        'category_id',
        filters.category_id.toString()
      );

    }


    if (filters?.assigned_to !== undefined) {

      params = params.set(
        'assigned_to',
        filters.assigned_to.toString()
      );

    }


    if (filters?.page !== undefined) {

      params = params.set(
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
   * CATEGORÍAS
   * ==========================================================
   *
   * GET /api/categories
   */

  getCategories(): Observable<TicketCategory[]> {

    return this.http.get<
      TicketCategory[] | { data: TicketCategory[] }
    >(
      `${this.apiBaseUrl}/categories`
    ).pipe(

      map(response => {

        if (Array.isArray(response)) {
          return response;
        }

        return response.data;

      })

    );

  }


  /*
   * ==========================================================
   * ACTIVOS
   * ==========================================================
   *
   * GET /api/assets
   */

  getAssets(): Observable<TicketAsset[]> {

    return this.http.get<
      TicketAsset[] | { data: TicketAsset[] }
    >(
      `${this.apiBaseUrl}/assets`
    ).pipe(

      map(response => {

        if (Array.isArray(response)) {
          return response;
        }

        return response.data;

      })

    );

  }

}