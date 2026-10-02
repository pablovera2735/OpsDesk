import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  TicketService,
  Ticket
} from '../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss'
})
export class TicketListComponent implements OnInit {

  private readonly ticketService = inject(TicketService);

  readonly tickets = signal<Ticket[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {

    this.loading.set(true);
    this.error.set('');

    this.ticketService.getTickets().subscribe({

      next: (response) => {

        console.log('Tickets recibidos:', response);

        this.tickets.set(response.data);

        this.loading.set(false);
      },

      error: (error) => {

        console.error(
          'Error cargando tickets:',
          error
        );

        this.error.set(
          'No se pudieron cargar los tickets.'
        );

        this.loading.set(false);
      }

    });
  }
}