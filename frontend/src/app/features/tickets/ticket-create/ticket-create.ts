import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  TicketService,
  TicketCategory,
  TicketAsset,
  CreateTicketPayload
} from '../../../core/services/ticket.service';


@Component({
  selector: 'app-ticket-create',
  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.scss'
})
export class TicketCreateComponent implements OnInit {

  private readonly router = inject(Router);

  private readonly ticketService =
    inject(TicketService);


  readonly title = signal('');

  readonly description = signal('');

  readonly priority =
    signal<CreateTicketPayload['priority']>('medium');

  readonly categoryId = signal('');

  readonly assetId = signal('');


  readonly categories =
    signal<TicketCategory[]>([]);

  readonly assets =
    signal<TicketAsset[]>([]);


  readonly loadingOptions =
    signal(true);

  readonly error =
    signal('');

  readonly saving =
    signal(false);


  ngOnInit(): void {

    this.loadOptions();

  }


  loadOptions(): void {

    this.loadingOptions.set(true);

    this.error.set('');


    this.ticketService
      .getCategories()
      .subscribe({

        next: (categories) => {

          this.categories.set(categories);

          this.loadingOptions.set(false);

        },

        error: (error) => {

          console.error(
            'Error cargando categorías:',
            error
          );

          this.error.set(
            'No se pudieron cargar las categorías.'
          );

          this.loadingOptions.set(false);

        }

      });


    this.ticketService
      .getAssets()
      .subscribe({

        next: (assets) => {

          this.assets.set(assets);

        },

        error: (error) => {

          console.error(
            'Error cargando activos:',
            error
          );

        }

      });

  }


  createTicket(): void {

    this.error.set('');


    const title =
      this.title().trim();

    const description =
      this.description().trim();


    if (!title) {

      this.error.set(
        'El título es obligatorio.'
      );

      return;

    }


    if (!description) {

      this.error.set(
        'La descripción es obligatoria.'
      );

      return;

    }


    if (!this.categoryId()) {

      this.error.set(
        'Debes seleccionar una categoría.'
      );

      return;

    }


    if (this.saving()) {
      return;
    }


    const payload: CreateTicketPayload = {

      title,

      description,

      priority:
        this.priority(),

      category_id:
        Number(this.categoryId()),

      asset_id:
        this.assetId()
          ? Number(this.assetId())
          : null

    };


    console.log(
      'Creando ticket:',
      payload
    );


    this.saving.set(true);


    this.ticketService
      .createTicket(payload)
      .subscribe({

        next: (response) => {

          console.log(
            'Ticket creado correctamente:',
            response
          );


          this.saving.set(false);


          if (response.data?.id) {

            this.router.navigate([
              '/tickets',
              response.data.id
            ]);

            return;

          }


          this.router.navigate([
            '/tickets'
          ]);

        },


        error: (error) => {

          console.error(
            'Error creando ticket:',
            error
          );


          this.saving.set(false);


          if (error.status === 422) {

            this.error.set(
              error.error?.message ||
              'Los datos enviados no son válidos.'
            );

            return;

          }


          if (error.status === 401) {

            this.error.set(
              'Tu sesión ha caducado. Inicia sesión de nuevo.'
            );

            return;

          }


          this.error.set(
            'No se pudo crear el ticket. Inténtalo de nuevo.'
          );

        }

      });

  }


  cancel(): void {

    this.router.navigate([
      '/tickets'
    ]);

  }

}