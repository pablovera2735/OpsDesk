import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService,
  User
} from '../../../core/services/auth.service';

import {
  TicketService,
  Ticket,
  TicketCategory,
  UpdateTicketPayload
} from '../../../core/services/ticket.service';


/*
 * ============================================================
 * MODOS DE ASIGNACIÓN
 * ============================================================
 *
 * keep = mantener técnico actual
 * none = quitar asignación
 * me   = asignarme a mí
 */

type AssignmentMode =
  | 'keep'
  | 'none'
  | 'me';


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
export class TicketEditComponent
  implements OnInit {


  /*
   * ==========================================================
   * SERVICIOS
   * ==========================================================
   */

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly ticketService =
    inject(TicketService);

  private readonly authService =
    inject(AuthService);


  /*
   * ==========================================================
   * TICKET
   * ==========================================================
   */

  readonly ticket =
    signal<Ticket | null>(null);


  /*
   * ==========================================================
   * FORMULARIO
   * ==========================================================
   */

  readonly title =
    signal('');

  readonly description =
    signal('');


  readonly priority =
    signal<
      UpdateTicketPayload['priority']
    >('medium');


  readonly status =
    signal<
      UpdateTicketPayload['status']
    >('open');


  readonly categoryId =
    signal('');


  readonly assetId =
    signal('');


  /*
   * ==========================================================
   * CATEGORÍAS
   * ==========================================================
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
   * ==========================================================
   * USUARIO ACTUAL
   * ==========================================================
   */

  readonly currentUser =
    signal<User | null>(null);


  /*
   * ==========================================================
   * ASIGNACIÓN
   * ==========================================================
   */

  readonly assignmentMode =
    signal<AssignmentMode>('none');


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

  readonly loading =
    signal(true);

  readonly loadingUser =
    signal(true);

  readonly saving =
    signal(false);

  readonly error =
    signal('');


  /*
   * ==========================================================
   * INIT
   * ==========================================================
   */

  ngOnInit(): void {

    this.loadCurrentUser();

    this.loadTicket();

  }


  /*
   * ==========================================================
   * OBTENER ID DEL TICKET
   * ==========================================================
   */

  private getTicketId(): number | null {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    if (
      !id ||
      Number.isNaN(id)
    ) {

      return null;

    }


    return id;

  }


  /*
   * ==========================================================
   * CARGAR USUARIO ACTUAL
   * ==========================================================
   */

  private loadCurrentUser(): void {

    this.loadingUser.set(true);


    this.authService.me().subscribe({

      next: (
        response: { data: User }
      ) => {

        console.log(
          'Usuario actual:',
          response.data
        );


        this.currentUser.set(
          response.data
        );


        this.loadingUser.set(false);


        /*
         * Si el ticket ya está cargado,
         * calculamos la asignación.
         */

        this.updateAssignmentMode();

      },


      error: (
        error: HttpErrorResponse
      ) => {

        console.error(
          'Error obteniendo usuario:',
          error
        );


        this.currentUser.set(
          null
        );


        this.loadingUser.set(false);

      }

    });

  }


  /*
   * ==========================================================
   * CARGAR TICKET
   * ==========================================================
   */

  private loadTicket(): void {

    this.loading.set(true);

    this.error.set('');


    const id =
      this.getTicketId();


    /*
     * ID inválido
     */

    if (id === null) {

      this.error.set(
        'ID de ticket no válido.'
      );

      this.loading.set(false);

      return;

    }


    /*
     * GET /api/tickets/{id}
     */

    this.ticketService
      .getTicket(id)
      .subscribe({

        next: (
          response: { data: Ticket }
        ) => {

          console.log(
            'Ticket recibido:',
            response.data
          );


          const ticket =
            response.data;


          this.ticket.set(
            ticket
          );


          /*
           * Rellenar formulario
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


          this.categoryId.set(
            ticket.category_id
              ? ticket.category_id.toString()
              : ''
          );


          this.assetId.set(
            ticket.asset_id
              ? ticket.asset_id.toString()
              : ''
          );


          /*
           * Calcular asignación
           */

          this.updateAssignmentMode();


          this.loading.set(false);

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error cargando ticket:',
            error
          );


          this.loading.set(false);


          if (
            error.status === 404
          ) {

            this.error.set(
              'El ticket no existe.'
            );

            return;

          }


          if (
            error.status === 401
          ) {

            this.error.set(
              'Tu sesión ha caducado.'
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
   * ==========================================================
   * DETERMINAR ASIGNACIÓN ACTUAL
   * ==========================================================
   */

  private updateAssignmentMode(): void {

    const ticket =
      this.ticket();

    const user =
      this.currentUser();


    /*
     * Todavía no tenemos ticket
     */

    if (!ticket) {

      return;

    }


    /*
     * Sin asignar
     */

    if (
      ticket.assigned_to === null ||
      ticket.assigned_to === undefined
    ) {

      this.assignmentMode.set(
        'none'
      );

      return;

    }


    /*
     * Está asignado al usuario actual
     */

    if (
      user &&
      ticket.assigned_to === user.id
    ) {

      this.assignmentMode.set(
        'me'
      );

      return;

    }


    /*
     * Está asignado a otra persona
     */

    this.assignmentMode.set(
      'keep'
    );

  }


  /*
   * ==========================================================
   * CAMBIAR ASIGNACIÓN
   * ==========================================================
   */

  changeAssignment(
    value: AssignmentMode
  ): void {

    this.assignmentMode.set(
      value
    );

  }


  /*
   * ==========================================================
   * ACTUALIZAR TICKET
   * ==========================================================
   */

  updateTicket(): void {

    this.error.set('');


    /*
     * Evitar doble envío
     */

    if (
      this.saving()
    ) {

      return;

    }


    /*
     * Obtener datos
     */

    const title =
      this.title().trim();

    const description =
      this.description().trim();


    /*
     * ======================================================
     * VALIDACIONES
     * ======================================================
     */

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


    if (!this.status()) {

      this.error.set(
        'Debes seleccionar un estado.'
      );

      return;

    }


    /*
     * ======================================================
     * ID
     * ======================================================
     */

    const id =
      this.getTicketId();


    if (id === null) {

      this.error.set(
        'ID de ticket no válido.'
      );

      return;

    }


    /*
     * ======================================================
     * PAYLOAD
     * ======================================================
     */

    const payload:
      UpdateTicketPayload = {

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


    /*
     * ======================================================
     * ASIGNACIÓN
     * ======================================================
     *
     * keep:
     * No mandamos assigned_to.
     * El backend mantiene la asignación actual.
     *
     * none:
     * assigned_to = null.
     *
     * me:
     * assigned_to = ID del usuario actual.
     */

    if (
      this.assignmentMode() === 'none'
    ) {

      payload.assigned_to =
        null;

    }


    if (
      this.assignmentMode() === 'me'
    ) {

      if (
        !this.currentUser()
      ) {

        this.error.set(
          'No se ha podido identificar al usuario actual.'
        );

        return;

      }


      payload.assigned_to =
        this.currentUser()!.id;

    }


    /*
     * Si es "keep", no añadimos assigned_to.
     */


    console.log(
      'Actualizando ticket:',
      id
    );


    console.log(
      'Payload:',
      payload
    );


    /*
     * ======================================================
     * GUARDAR
     * ======================================================
     */

    this.saving.set(true);


    /*
     * PATCH /api/tickets/{id}
     */

    this.ticketService
      .updateTicket(
        id,
        payload
      )
      .subscribe({

        /*
         * ================================================
         * ÉXITO
         * ================================================
         */

        next: (
          response: { data: Ticket }
        ) => {

          console.log(
            'Ticket actualizado:',
            response
          );


          this.saving.set(false);


          /*
           * Volvemos al detalle
           */

          this.router.navigate([
            '/tickets',
            id
          ]);

        },


        /*
         * ================================================
         * ERROR
         * ================================================
         */

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error actualizando ticket:',
            error
          );


          this.saving.set(false);


          /*
           * Validación Laravel
           */

          if (
            error.status === 422
          ) {

            this.error.set(
              error.error?.message ||
              'Los datos enviados no son válidos.'
            );

            return;

          }


          /*
           * No autorizado
           */

          if (
            error.status === 401
          ) {

            this.error.set(
              'Tu sesión ha caducado. Inicia sesión de nuevo.'
            );

            return;

          }


          /*
           * Ticket inexistente
           */

          if (
            error.status === 404
          ) {

            this.error.set(
              'El ticket no existe.'
            );

            return;

          }


          /*
           * Error servidor
           */

          if (
            error.status >= 500
          ) {

            this.error.set(
              'Error del servidor. Inténtalo de nuevo.'
            );

            return;

          }


          /*
           * Error genérico
           */

          this.error.set(
            'No se pudo actualizar el ticket.'
          );

        }

      });

  }


  /*
   * ==========================================================
   * CANCELAR
   * ==========================================================
   */

  cancel(): void {

    const id =
      this.getTicketId();


    if (id !== null) {

      this.router.navigate([
        '/tickets',
        id
      ]);

      return;

    }


    this.router.navigate([
      '/tickets'
    ]);

  }

}