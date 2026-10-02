import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  TicketService,
  Ticket
} from '../../../core/services/ticket.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    FormsModule,
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

  readonly searchTerm = signal('');

  readonly selectedStatus = signal('');

  readonly selectedPriority = signal('');

  // PAGINACIÓN

  readonly currentPage = signal(1);

  readonly lastPage = signal(1);

  readonly totalTickets = signal(0);

  readonly perPage = signal(0);


  readonly filteredTickets = computed(() => {

    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    return this.tickets().filter((ticket) => {

      if (!search) {
        return true;
      }

      return (
        ticket.code.toLowerCase().includes(search) ||
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search)
      );

    });

  });


  ngOnInit(): void {
    this.loadTickets(1);
  }


  loadTickets(page: number = this.currentPage()): void {

    this.loading.set(true);

    this.error.set('');

    this.ticketService.getTickets({

      status: this.selectedStatus() || undefined,

      priority: this.selectedPriority() || undefined,

      page

    }).subscribe({

      next: (response) => {

        console.log('Tickets recibidos:', response);

        this.tickets.set(response.data);

        this.currentPage.set(response.current_page);

        this.lastPage.set(response.last_page);

        this.totalTickets.set(response.total);

        this.perPage.set(response.per_page);

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


  applyFilters(): void {

    this.loadTickets(1);

  }


  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedStatus.set('');

    this.selectedPriority.set('');

    this.loadTickets(1);

  }


  previousPage(): void {

    if (this.currentPage() > 1) {

      this.loadTickets(
        this.currentPage() - 1
      );

    }

  }


  nextPage(): void {

    if (this.currentPage() < this.lastPage()) {

      this.loadTickets(
        this.currentPage() + 1
      );

    }

  }


  goToPage(page: number): void {

    if (
      page >= 1 &&
      page <= this.lastPage() &&
      page !== this.currentPage()
    ) {

      this.loadTickets(page);

    }

  }

}