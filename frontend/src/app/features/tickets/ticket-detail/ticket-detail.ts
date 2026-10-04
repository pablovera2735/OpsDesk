import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  AuthService,
  User
} from '../../../core/services/auth.service';

import {
  TicketService,
  Ticket,
  TicketHistory
} from '../../../core/services/ticket.service';


@Component({
  selector: 'app-ticket-detail',

  standalone: true,

  imports: [
    RouterLink,
    DatePipe,
    FormsModule
  ],

  templateUrl: './ticket-detail.html',

  styleUrl: './ticket-detail.scss'
})
export class TicketDetailComponent
  implements OnInit {


  /*
   * ==========================================================
   * SERVICIOS
   * ==========================================================
   */

  private readonly route =
    inject(ActivatedRoute);

  private readonly ticketService =
    inject(TicketService);

  private readonly authService =
    inject(AuthService);


  /*
   * ==========================================================
   * DATOS
   * ==========================================================
   */

  readonly ticket =
    signal<Ticket | null>(null);


  readonly currentUser =
    signal<User | null>(null);


  /*
   * ==========================================================
   * ESTADO
   * ==========================================================
   */

  readonly loading =
    signal(true);

  readonly error =
    signal('');


  /*
   * ==========================================================
   * COMENTARIOS
   * ==========================================================
   */

  readonly commentMessage =
    signal('');

  readonly commentInternal =
    signal(false);

  readonly commentSaving =
    signal(false);

  readonly commentError =
    signal('');

  readonly commentSuccess =
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
   * CARGAR USUARIO
   * ==========================================================
   */

  private loadCurrentUser(): void {

    this.authService.me().subscribe({

      next: (
        response: { data: User }
      ) => {

        this.currentUser.set(
          response.data
        );

      },

      error: (
        error: HttpErrorResponse
      ) => {

        console.error(
          'Error cargando usuario:',
          error
        );

      }

    });

  }


  /*
   * ==========================================================
   * CARGAR TICKET
   * ==========================================================
   */

  loadTicket(): void {

    this.loading.set(true);

    this.error.set('');


    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    if (
      !id ||
      Number.isNaN(id)
    ) {

      this.error.set(
        'ID de ticket no válido.'
      );

      this.loading.set(false);

      return;

    }


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


          this.ticket.set(
            response.data
          );


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
   * PERMISO COMENTARIO INTERNO
   * ==========================================================
   */

  canCreateInternalComment(): boolean {

    const user =
      this.currentUser();


    if (!user) {

      return false;

    }


    const role =
      user.role?.slug;


    return (
      role === 'admin' ||
      role === 'technician'
    );

  }


  /*
   * ==========================================================
   * AÑADIR COMENTARIO
   * ==========================================================
   */

  addComment(): void {

    this.commentError.set('');

    this.commentSuccess.set('');


    const message =
      this.commentMessage().trim();


    /*
     * Validación
     */

    if (!message) {

      this.commentError.set(
        'Escribe un comentario.'
      );

      return;

    }


    if (
      message.length > 5000
    ) {

      this.commentError.set(
        'El comentario no puede superar los 5000 caracteres.'
      );

      return;

    }


    /*
     * Ticket
     */

    const ticket =
      this.ticket();


    if (!ticket) {

      this.commentError.set(
        'No se ha cargado el ticket.'
      );

      return;

    }


    /*
     * Seguridad adicional
     *
     * Aunque el backend también lo comprueba,
     * no permitimos desde Angular que un usuario
     * normal intente enviar comentario interno.
     */

    if (
      this.commentInternal() &&
      !this.canCreateInternalComment()
    ) {

      this.commentError.set(
        'No tienes permisos para crear comentarios internos.'
      );

      return;

    }


    if (
      this.commentSaving()
    ) {

      return;

    }


    /*
     * Payload
     */

    const payload = {

      message,

      internal:
        this.commentInternal()

    };


    console.log(
      'Añadiendo comentario:',
      payload
    );


    this.commentSaving.set(true);


    /*
     * POST /api/tickets/{id}/comments
     */

    this.ticketService
      .addComment(
        ticket.id,
        payload
      )
      .subscribe({

        next: (
          response
        ) => {

          console.log(
            'Comentario creado:',
            response
          );


          this.commentSaving.set(false);


          this.commentMessage.set('');

          this.commentInternal.set(false);


          this.commentSuccess.set(
            'Comentario añadido correctamente.'
          );


          /*
           * Volvemos a cargar el ticket.
           *
           * Así aparecen:
           *
           * - comentario
           * - usuario
           * - fecha
           * - historial comment_added
           */

          this.loadTicket();


          /*
           * Quitamos el mensaje después de unos segundos.
           */

          setTimeout(() => {

            this.commentSuccess.set('');

          }, 3000);

        },


        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error añadiendo comentario:',
            error
          );


          this.commentSaving.set(false);


          /*
           * 403
           */

          if (
            error.status === 403
          ) {

            this.commentError.set(
              error.error?.message ||
              'No tienes permisos para realizar esta acción.'
            );

            return;

          }


          /*
           * 422
           */

          if (
            error.status === 422
          ) {

            this.commentError.set(
              error.error?.message ||
              'El comentario no es válido.'
            );

            return;

          }


          /*
           * 401
           */

          if (
            error.status === 401
          ) {

            this.commentError.set(
              'Tu sesión ha caducado. Inicia sesión de nuevo.'
            );

            return;

          }


          this.commentError.set(
            'No se pudo añadir el comentario.'
          );

        }

      });

  }


  /*
   * ==========================================================
   * HISTORIAL
   * ==========================================================
   */

  formatHistoryAction(
    history: TicketHistory
  ): string {

    switch (
      history.action
    ) {

      case 'created':
        return 'Ticket creado';

      case 'assigned':
        return 'Técnico asignado';

      case 'status_changed':
        return 'Estado cambiado';

      case 'priority_changed':
        return 'Prioridad cambiada';

      case 'category_changed':
        return 'Categoría cambiada';

      case 'comment_added':
        return 'Comentario añadido';

      case 'resolution_added':
        return 'Resolución añadida';

      default:
        return this.capitalize(
          history.action
        );

    }

  }


  /*
   * ==========================================================
   * CAMPO DEL HISTORIAL
   * ==========================================================
   */

  formatHistoryField(
    field: string | null
  ): string {

    if (!field) {

      return '';

    }


    switch (field) {

      case 'title':
        return 'Título';

      case 'description':
        return 'Descripción';

      case 'status':
        return 'Estado';

      case 'priority':
        return 'Prioridad';

      case 'category_id':
        return 'Categoría';

      case 'assigned_to':
        return 'Técnico';

      case 'asset_id':
        return 'Activo';

      default:
        return this.capitalize(
          field.replaceAll(
            '_',
            ' '
          )
        );

    }

  }


  /*
   * ==========================================================
   * VALOR HISTORIAL
   * ==========================================================
   */

  formatHistoryValue(
    field: string | null,
    value: string | null
  ): string {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      return 'Sin valor';

    }


    switch (field) {

      /*
       * ESTADO
       */

      case 'status':

        switch (value) {

          case 'open':
            return 'Abierto';

          case 'in_progress':
            return 'En progreso';

          case 'resolved':
            return 'Resuelto';

          case 'closed':
            return 'Cerrado';

        }

        break;


      /*
       * PRIORIDAD
       */

      case 'priority':

        switch (value) {

          case 'low':
            return 'Baja';

          case 'medium':
            return 'Media';

          case 'high':
            return 'Alta';

          case 'critical':
            return 'Crítica';

        }

        break;


      /*
       * ASIGNACIÓN
       */

      case 'assigned_to':

        return `Usuario #${value}`;


      /*
       * CATEGORÍA
       */

      case 'category_id':

        return `Categoría #${value}`;


      /*
       * ACTIVO
       */

      case 'asset_id':

        return `Activo #${value}`;

    }


    return value;

  }


  /*
   * ==========================================================
   * CAPITALIZAR
   * ==========================================================
   */

  private capitalize(
    value: string
  ): string {

    if (!value) {

      return value;

    }


    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );

  }

}