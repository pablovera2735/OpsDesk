<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketCommentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@opsdesk.local')->firstOrFail();
        $technician = User::where('email', 'tecnico@opsdesk.local')->firstOrFail();
        $user = User::where('email', 'usuario@opsdesk.local')->firstOrFail();

        $ticket1 = Ticket::where('code', 'INC-2026-000001')->firstOrFail();
        $ticket2 = Ticket::where('code', 'INC-2026-000002')->firstOrFail();
        $ticket3 = Ticket::where('code', 'INC-2026-000003')->firstOrFail();
        $ticket4 = Ticket::where('code', 'INC-2026-000004')->firstOrFail();

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket1->id,
                'user_id' => $user->id,
                'message' => 'Desde esta mañana no puedo acceder a Internet.',
            ],
            [
                'internal' => false,
            ]
        );

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket1->id,
                'user_id' => $technician->id,
                'message' => 'Voy a revisar la configuración de red del equipo.',
            ],
            [
                'internal' => false,
            ]
        );

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket1->id,
                'user_id' => $technician->id,
                'message' => 'He detectado un problema con el adaptador de red.',
            ],
            [
                'internal' => true,
            ]
        );

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket2->id,
                'user_id' => $user->id,
                'message' => 'Microsoft Word no inicia correctamente.',
            ],
            [
                'internal' => false,
            ]
        );

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket2->id,
                'user_id' => $technician->id,
                'message' => 'Estoy revisando la instalación de Microsoft 365.',
            ],
            [
                'internal' => false,
            ]
        );

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket3->id,
                'user_id' => $user->id,
                'message' => 'Necesito acceso a la carpeta compartida del departamento.',
            ],
            [
                'internal' => false,
            ]
        );

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket4->id,
                'user_id' => $admin->id,
                'message' => 'El equipo presenta lentitud desde esta semana.',
            ],
            [
                'internal' => false,
            ]
        );

        TicketComment::updateOrCreate(
            [
                'ticket_id' => $ticket4->id,
                'user_id' => $technician->id,
                'message' => 'Se han realizado tareas de mantenimiento y optimización.',
            ],
            [
                'internal' => false,
            ]
        );
    }
}