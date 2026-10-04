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
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService,
  User
} from '../../../core/services/auth.service';

import {
  TicketService,
  TicketCategory,
  Ticket,
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
export class TicketCreateComponent
  implements OnInit {


  /*
   * =========================================================
   * SERVICIOS
   * =========================================================
   */

  private readonly router =
    inject(Router);

  private readonly ticketService =
    inject(TicketService);

  private readonly authService =
    inject(AuthService);


  /*
   * =========================================================
   * FORMULARIO
   * =========================================================
   */

  readonly title =
    signal('');

  readonly description =
    signal('');

  readonly priority =
    signal<CreateTicketPayload['priority']>(
      'medium'
    );

  readonly categoryId =
    signal('');

  readonly assetId =
    signal('');


  /*
   * =========================================================
   * CATEGORÍAS
   * =========================================================
   *
   * De momento usamos las categorías que ya sabemos
   * que existen en la aplicación.
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
   * =========================================================
   * USUARIO ACTUAL
   * =========================================================
   */

  readonly currentUser =
    signal<User | null>(null);


  /*
   * =========================================================
   * ASIGNACIÓN
   * =========================================================
   *
   * false = sin asignar
   *
   * true = asignarme a mí
   */

  readonly assignedToMe =
    signal(false);


  /*
   * =========================================================
   * ESTADOS
   * =========================================================
   */

  readonly loadingUser =
    signal(true);

  readonly saving =
    signal(false);

  readonly error =
    signal('');


  /*
   * =========================================================
   * INIT
   * =========================================================
   */

  ngOnInit(): void {

    this.loadCurrentUser();

  }


  /*
   * =========================================================
   * CARGAR USUARIO AUTENTICADO
   * =========================================================
   *
   * GET /api/me
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
   * =========================================================
   * CAMBIAR ASIGNACIÓN
   * =========================================================
   */

  changeAssignment(
    value: string
  ): void {

    this.assignedToMe.set(
      value === 'me'
    );

  }


  /*
   * =========================================================
   * CREAR TICKET
   * =========================================================
   */

  createTicket(): void {

    this.error.set('');


    /*
     * Evitar doble envío
     */

    if (this.saving()) {

      return;

    }


    /*
     * Obtener valores
     */

    const title =
      this.title().trim();

    const description =
      this.description().trim();


    /*
     * =====================================================
     * VALIDACIÓN DEL TÍTULO
     * =====================================================
     */

    if (!title) {

      this.error.set(
        'El título es obligatorio.'
      );

      return;

    }


    /*
     * =====================================================
     * VALIDACIÓN DE DESCRIPCIÓN
     * =====================================================
     */

    if (!description) {

      this.error.set(
        'La descripción es obligatoria.'
      );

      return;

    }


    /*
     * =====================================================
     * VALIDACIÓN DE CATEGORÍA
     * =====================================================
     */

    if (!this.categoryId()) {

      this.error.set(
        'Debes seleccionar una categoría.'
      );

      return;

    }


    /*
     * =====================================================
     * VALIDACIÓN DE ASIGNACIÓN
     * =====================================================
     *
     * Si el usuario ha elegido "Asignarme a mí",
     * necesitamos conocer su ID.
     */

    if (
      this.assignedToMe() &&
      !this.currentUser()
    ) {

      this.error.set(
        'No se ha podido identificar al usuario actual.'
      );

      return;

    }


    /*
     * =====================================================
     * ID DEL TÉCNICO
     * =====================================================
     *
     * Sin asignar:
     *
     * null
     *
     * Asignarme:
     *
     * ID del usuario autenticado
     */

    const assignedTo =
      this.assignedToMe()
        ? this.currentUser()!.id
        : null;


    /*
     * =====================================================
     * PAYLOAD
     * =====================================================
     */

    const payload:
      CreateTicketPayload = {

      title,

      description,

      priority:
        this.priority(),

      category_id:
        Number(this.categoryId()),

      assigned_to:
        assignedTo,

      asset_id:
        this.assetId()
          ? Number(this.assetId())
          : null

    };


    console.log(
      'Payload nuevo ticket:',
      payload
    );


    /*
     * =====================================================
     * GUARDANDO
     * =====================================================
     */

    this.saving.set(true);


    /*
     * =====================================================
     * POST
     * =====================================================
     */

    this.ticketService
      .createTicket(payload)
      .subscribe({

        /*
         * ===============================================
         * ÉXITO
         * ===============================================
         */

        next: (
          response: { data: Ticket }
        ) => {

          console.log(
            'Ticket creado correctamente:',
            response
          );


          this.saving.set(false);


          /*
           * Ir al detalle del ticket creado
           */

          if (
            response.data?.id
          ) {

            this.router.navigate([
              '/tickets',
              response.data.id
            ]);

            return;

          }


          /*
           * Fallback
           */

          this.router.navigate([
            '/tickets'
          ]);

        },


        /*
         * ===============================================
         * ERROR
         * ===============================================
         */

        error: (
          error: HttpErrorResponse
        ) => {

          console.error(
            'Error creando ticket:',
            error
          );


          this.saving.set(false);


          /*
           * Error de validación Laravel
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
           * No autenticado
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
           * Error de servidor
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
           * Error general
           */

          this.error.set(
            'No se pudo crear el ticket. Inténtalo de nuevo.'
          );

        }

      });

  }


  /*
   * =========================================================
   * CANCELAR
   * =========================================================
   */

  cancel(): void {

    this.router.navigate([
      '/tickets'
    ]);

  }

}