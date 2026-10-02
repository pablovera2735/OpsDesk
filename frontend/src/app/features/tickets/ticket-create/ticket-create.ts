import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
export class TicketCreateComponent {

  private readonly router = inject(Router);

  readonly title = signal('');
  readonly description = signal('');
  readonly priority = signal('medium');
  readonly categoryId = signal('');
  readonly assetId = signal('');

  readonly error = signal('');

  readonly saving = signal(false);


  createTicket(): void {

    this.error.set('');

    const title = this.title().trim();
    const description = this.description().trim();

    if (!title) {
      this.error.set('El título es obligatorio.');
      return;
    }

    if (!description) {
      this.error.set('La descripción es obligatoria.');
      return;
    }

    if (!this.categoryId()) {
      this.error.set('Debes seleccionar una categoría.');
      return;
    }

    this.saving.set(true);

    /*
     * De momento dejamos preparada la información
     * del formulario.
     *
     * En el siguiente paso conectaremos este método
     * con el POST real de la API.
     */

    console.log('Nuevo ticket:', {
      title,
      description,
      priority: this.priority(),
      category_id: Number(this.categoryId()),
      asset_id: this.assetId()
        ? Number(this.assetId())
        : null
    });

    this.saving.set(false);

    this.error.set(
      'Formulario correcto. Falta conectar el POST de la API.'
    );
  }


  cancel(): void {
    this.router.navigate(['/tickets']);
  }

}
