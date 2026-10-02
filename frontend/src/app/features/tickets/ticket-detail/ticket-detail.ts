import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  TicketService,
  Ticket
} from '../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],

  template: `
    <main class="ticket-detail">

      <header class="page-header">

        <div>
          <h1>Detalle del ticket</h1>
          <p>Información de la incidencia.</p>
        </div>

        <a
          routerLink="/tickets"
          class="back-button"
        >
          ← Volver a tickets
        </a>

      </header>


      @if (loading()) {

        <section class="message">
          Cargando ticket...
        </section>

      } @else if (error()) {

        <section class="message error">
          {{ error() }}
        </section>

      } @else if (ticket(); as currentTicket) {

        <section class="ticket-card">

          <!-- CABECERA -->

          <div class="ticket-header">

            <div>

              <span class="ticket-code">
                {{ currentTicket.code }}
              </span>

              <h2>
                {{ currentTicket.title }}
              </h2>

            </div>


            <div class="badges">

              <span
                class="badge priority-{{ currentTicket.priority }}"
              >
                {{ getPriorityLabel(currentTicket.priority) }}
              </span>

              <span
                class="badge status-{{ currentTicket.status }}"
              >
                {{ getStatusLabel(currentTicket.status) }}
              </span>

            </div>

          </div>


          <!-- DESCRIPCIÓN -->

          <div class="ticket-section">

            <h3>Descripción</h3>

            <p>
              {{ currentTicket.description }}
            </p>

          </div>


          <!-- INFORMACIÓN -->

          <div class="details-grid">

            <div class="detail-item">

              <span>Categoría</span>

              <strong>
                {{ currentTicket.category?.name || 'Sin categoría' }}
              </strong>

            </div>


            <div class="detail-item">

              <span>Creado por</span>

              <strong>
                {{ currentTicket.creator?.name || 'Desconocido' }}
              </strong>

            </div>


            <div class="detail-item">

              <span>Técnico asignado</span>

              <strong>
                {{ currentTicket.assigned_technician?.name || 'Sin asignar' }}
              </strong>

            </div>


            <div class="detail-item">

              <span>Activo</span>

              <strong>
                {{ currentTicket.asset?.hostname || 'Sin activo' }}
              </strong>

            </div>


            <div class="detail-item">

              <span>Creado</span>

              <strong>
                {{ currentTicket.created_at | date:'dd/MM/yyyy HH:mm' }}
              </strong>

            </div>


            <div class="detail-item">

              <span>Última actualización</span>

              <strong>
                {{ currentTicket.updated_at | date:'dd/MM/yyyy HH:mm' }}
              </strong>

            </div>

          </div>


          <!-- ACTIVO -->

          @if (currentTicket.asset; as asset) {

            <div class="ticket-section">

              <h3>Información del activo</h3>

              <div class="asset-grid">

                <div>
                  <span>Código</span>
                  <strong>
                    {{ asset.asset_code }}
                  </strong>
                </div>

                <div>
                  <span>Hostname</span>
                  <strong>
                    {{ asset.hostname }}
                  </strong>
                </div>

                <div>
                  <span>Tipo</span>
                  <strong>
                    {{ asset.type }}
                  </strong>
                </div>

                <div>
                  <span>Marca</span>
                  <strong>
                    {{ asset.brand }}
                  </strong>
                </div>

                <div>
                  <span>Modelo</span>
                  <strong>
                    {{ asset.model }}
                  </strong>
                </div>

                <div>
                  <span>Número de serie</span>
                  <strong>
                    {{ asset.serial_number }}
                  </strong>
                </div>

                <div>
                  <span>Sistema operativo</span>
                  <strong>
                    {{ asset.operating_system || 'No indicado' }}
                  </strong>
                </div>

                <div>
                  <span>Dirección IP</span>
                  <strong>
                    {{ asset.ip_address || 'No indicada' }}
                  </strong>
                </div>

                <div>
                  <span>Dirección MAC</span>
                  <strong>
                    {{ asset.mac_address || 'No indicada' }}
                  </strong>
                </div>

                <div>
                  <span>Estado</span>
                  <strong>
                    {{ asset.status }}
                  </strong>
                </div>

              </div>

            </div>

          }

        </section>

      }

    </main>
  `,


  styles: [`

    :host {
      display: block;
    }


    .ticket-detail {
      min-height: 100vh;
      padding: 40px;
      background: #f4f7fb;
      color: #111827;
    }


    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 30px;
    }


    .page-header h1 {
      margin: 0 0 6px;
      font-size: 32px;
    }


    .page-header p {
      margin: 0;
      color: #6b7280;
    }


    .back-button {
      padding: 10px 16px;
      border-radius: 8px;
      background: #111827;
      color: white;
      text-decoration: none;
      font-size: 14px;
      white-space: nowrap;
    }


    .back-button:hover {
      opacity: 0.9;
    }


    .message {
      padding: 20px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    }


    .message.error {
      color: #b91c1c;
      border-color: #fecaca;
      background: #fff;
    }


    .ticket-card {
      padding: 30px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
    }


    .ticket-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 30px;
      padding-bottom: 25px;
      border-bottom: 1px solid #e5e7eb;
    }


    .ticket-code {
      display: inline-block;
      margin-bottom: 8px;
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
    }


    .ticket-header h2 {
      margin: 0;
      font-size: 26px;
    }


    .badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }


    .badge {
      display: inline-block;
      padding: 6px 11px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
    }


    .priority-low {
      background: #dcfce7;
      color: #166534;
    }


    .priority-medium {
      background: #fef3c7;
      color: #92400e;
    }


    .priority-high {
      background: #fed7aa;
      color: #9a3412;
    }


    .priority-critical {
      background: #fee2e2;
      color: #b91c1c;
    }


    .status-open {
      background: #dbeafe;
      color: #1d4ed8;
    }


    .status-in_progress {
      background: #fef3c7;
      color: #92400e;
    }


    .status-resolved {
      background: #dcfce7;
      color: #166534;
    }


    .status-closed {
      background: #e2e8f0;
      color: #475569;
    }


    .ticket-section {
      padding: 25px 0;
      border-bottom: 1px solid #e5e7eb;
    }


    .ticket-section:last-child {
      border-bottom: 0;
    }


    .ticket-section h3 {
      margin: 0 0 10px;
      font-size: 18px;
    }


    .ticket-section p {
      margin: 0;
      color: #4b5563;
      line-height: 1.7;
      white-space: pre-wrap;
    }


    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      padding: 25px 0;
      border-bottom: 1px solid #e5e7eb;
    }


    .detail-item {
      padding: 18px;
      background: #f8fafc;
      border-radius: 10px;
    }


    .detail-item span,
    .asset-grid span {
      display: block;
      margin-bottom: 8px;
      color: #6b7280;
      font-size: 13px;
    }


    .detail-item strong,
    .asset-grid strong {
      font-size: 15px;
    }


    .asset-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }


    .asset-grid > div {
      padding: 15px;
      background: #f8fafc;
      border-radius: 10px;
    }


    @media (max-width: 1000px) {

      .details-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .asset-grid {
        grid-template-columns: repeat(2, 1fr);
      }

    }


    @media (max-width: 700px) {

      .ticket-detail {
        padding: 20px;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .ticket-header {
        flex-direction: column;
      }

      .details-grid,
      .asset-grid {
        grid-template-columns: 1fr;
      }

    }

  `]
})
export class TicketDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly ticketService =
    inject(TicketService);


  readonly ticket =
    signal<Ticket | null>(null);

  readonly loading =
    signal(true);

  readonly error =
    signal('');


  ngOnInit(): void {

    const idParam =
      this.route.snapshot.paramMap.get('id');

    console.log(
      '[TicketDetail] ID recibido:',
      idParam
    );


    const id =
      Number(idParam);


    if (!id || Number.isNaN(id)) {

      this.error.set(
        'ID de ticket no válido.'
      );

      this.loading.set(false);

      return;
    }


    this.loadTicket(id);
  }


  private loadTicket(id: number): void {

    console.log(
      '[TicketDetail] Cargando ticket:',
      id
    );


    this.loading.set(true);

    this.error.set('');


    this.ticketService
      .getTicket(id)
      .subscribe({

        next: (response) => {

          console.log(
            '[TicketDetail] Respuesta:',
            response
          );


          console.log(
            '[TicketDetail] Ticket:',
            response.data
          );


          this.ticket.set(
            response.data
          );


          this.loading.set(false);


          console.log(
            '[TicketDetail] Carga terminada'
          );

        },


        error: (error) => {

          console.error(
            '[TicketDetail] Error:',
            error
          );


          this.loading.set(false);


          if (error?.status === 404) {

            this.error.set(
              'El ticket no existe.'
            );

            return;
          }


          if (error?.status === 401) {

            this.error.set(
              'No estás autenticado.'
            );

            return;
          }


          if (error?.status === 403) {

            this.error.set(
              'No tienes permisos para ver este ticket.'
            );

            return;
          }


          this.error.set(
            'No se pudo cargar el ticket.'
          );

        }

      });
  }


  getPriorityLabel(
    priority: Ticket['priority']
  ): string {

    const labels: Record<
      Ticket['priority'],
      string
    > = {

      low: 'Baja',

      medium: 'Media',

      high: 'Alta',

      critical: 'Crítica'

    };


    return labels[priority];
  }


  getStatusLabel(
    status: Ticket['status']
  ): string {

    const labels: Record<
      Ticket['status'],
      string
    > = {

      open: 'Abierto',

      in_progress: 'En progreso',

      resolved: 'Resuelto',

      closed: 'Cerrado'

    };


    return labels[status];
  }

}