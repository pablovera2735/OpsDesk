import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  TicketService,
  TicketCategory,
  TicketAsset,
  UpdateTicketPayload
} from '../../../core/services/ticket.service';


@Component({
  selector: 'app-ticket-edit',
  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './ticket-edit.html',
  styleUrl: './ticket-edit.scss'
})
export class TicketEditComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly ticketService = inject(TicketService);


  private ticketId = 0;


  readonly title = signal('');

  readonly description = signal('');

  readonly priority =
    signal<UpdateTicketPayload['priority']>('medium');

  readonly status =
    signal<UpdateTicketPayload['status']>('open');

  readonly categoryId =
    signal('');

  readonly assetId =
    signal('');


  /*
   * Categorías disponibles.
   *
   * Las dejamos en frontend porque no queremos
   * hacer ninguna petición adicional al backend.
   */
  readonly categories =
    signal<TicketCategory[]>([
      {
        id: 1,
        name: 'Hardware',
        slug: 'hardware',
        description: 'Problemas de hardware',
        active: true
      },
      {
        id: 2,
        name: 'Impresoras',
        slug: 'impresoras',
        description: 'Problemas con impresoras',
        active: true
      },
      {
        id: 3,
        name: 'Redes',
        slug: 'redes',
        description: 'Problemas de red',
        active: true
      },
      {
        id: 4,
        name: 'Software',
        slug: 'software',
        description: 'Problemas de software',
        active: true
      },
      {
        id: 5,
        name: 'Accesos',
        slug: 'accesos',
        description: 'Problemas de acceso',
        active: true
      }
    ]);


  /*
   * No necesitamos cargar todos los activos.
   *
   * Si el ticket tiene un activo relacionado,
   * añadiremos ese activo al select.
   */
  readonly assets =
    signal<TicketAsset[]>([]);


  readonly loading =
    signal(true);

  readonly loadingOptions =
    signal(false);

  readonly saving =
    signal(false);

  readonly error =
    signal('');


  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );


    if (!id) {

      this.error.set(
        'ID de ticket no válido.'
      );

      this.loading.set(false);

      return;
    }


    this.ticketId = id;

    this.loadTicket();
  }


  /*
   * Cargar ticket
   */
  private loadTicket(): void {

    this.loading.set(true);

    this.error.set('');


    this.ticketService
      .getTicket(this.ticketId)
      .subscribe({

        next: (response) => {

          const ticket = response.data;


          /*
           * Datos principales
           */
          this.title.set(
            ticket.title
          );


          this.description.set(
            ticket.description
          );


          this.priority.set(
            ticket.priority
          );


          this.status.set(
            ticket.status
          );


          /*
           * Categoría
           */
          this.categoryId.set(
            ticket.category_id?.toString() || ''
          );


          /*
           * Activo
           */
          this.assetId.set(
            ticket.asset_id?.toString() || ''
          );


          /*
           * Si el ticket tiene un activo,
           * lo mostramos en el select.
           */
          if (ticket.asset) {

            this.assets.set([
              ticket.asset
            ]);

          } else {

            this.assets.set([]);

          }


          this.loading.set(false);

        },


        error: (error) => {

          console.error(
            'Error cargando ticket:',
            error
          );


          this.loading.set(false);


          if (error.status === 404) {

            this.error.set(
              'El ticket no existe.'
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
            'No se pudo cargar el ticket.'
          );

        }

      });

  }


  /*
   * Actualizar ticket
   */
  updateTicket(): void {

    this.error.set('');


    const title =
      this.title().trim();


    const description =
      this.description().trim();


    /*
     * Validación título
     */
    if (!title) {

      this.error.set(
        'El título es obligatorio.'
      );

      return;
    }


    /*
     * Validación descripción
     */
    if (!description) {

      this.error.set(
        'La descripción es obligatoria.'
      );

      return;
    }


    /*
     * Validación categoría
     */
    if (!this.categoryId()) {

      this.error.set(
        'Debes seleccionar una categoría.'
      );

      return;
    }


    /*
     * Evitar doble envío
     */
    if (this.saving()) {
      return;
    }


    /*
     * Payload
     */
    const payload: UpdateTicketPayload = {

      title,

      description,

      priority:
        this.priority(),

      status:
        this.status(),

      category_id:
        Number(this.categoryId()),

      asset_id:
        this.assetId()
          ? Number(this.assetId())
          : null

    };


    console.log(
      'Actualizando ticket:',
      payload
    );


    this.saving.set(true);


    /*
     * PATCH /api/tickets/{id}
     */
    this.ticketService
      .updateTicket(
        this.ticketId,
        payload
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Ticket actualizado correctamente:',
            response
          );


          this.saving.set(false);


          /*
           * Volvemos al detalle
           */
          this.router.navigate([
            '/tickets',
            this.ticketId
          ]);

        },


        error: (error) => {

          console.error(
            'Error actualizando ticket:',
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


          if (error.status === 403) {

            this.error.set(
              'No tienes permiso para editar este ticket.'
            );

            return;
          }


          if (error.status === 404) {

            this.error.set(
              'El ticket no existe.'
            );

            return;
          }


          this.error.set(
            'No se pudo actualizar el ticket.'
          );

        }

      });

  }


  /*
   * Cancelar edición
   */
  cancel(): void {

    this.router.navigate([
      '/tickets',
      this.ticketId
    ]);

  }

}