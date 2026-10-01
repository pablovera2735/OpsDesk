<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketHistorySeeder extends Seeder
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

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket1->id,
                'user_id' => $user->id,
                'action' => 'created',
                'field' => null,
                'old_value' => null,
                'new_value' => 'open',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket1->id,
                'user_id' => $technician->id,
                'action' => 'assigned',
                'field' => 'assigned_to',
                'old_value' => null,
                'new_value' => '2',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket1->id,
                'user_id' => $technician->id,
                'action' => 'status_changed',
                'field' => 'status',
                'old_value' => 'open',
                'new_value' => 'in_progress',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket2->id,
                'user_id' => $user->id,
                'action' => 'created',
                'field' => null,
                'old_value' => null,
                'new_value' => 'open',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket2->id,
                'user_id' => $technician->id,
                'action' => 'status_changed',
                'field' => 'status',
                'old_value' => 'open',
                'new_value' => 'in_progress',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket3->id,
                'user_id' => $user->id,
                'action' => 'created',
                'field' => null,
                'old_value' => null,
                'new_value' => 'open',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket4->id,
                'user_id' => $admin->id,
                'action' => 'created',
                'field' => null,
                'old_value' => null,
                'new_value' => 'open',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket4->id,
                'user_id' => $technician->id,
                'action' => 'status_changed',
                'field' => 'status',
                'old_value' => 'open',
                'new_value' => 'resolved',
            ]
        );

        TicketHistory::updateOrCreate(
            [
                'ticket_id' => $ticket4->id,
                'user_id' => $technician->id,
                'action' => 'resolution_added',
                'field' => 'resolution',
                'old_value' => null,
                'new_value' => 'Mantenimiento y optimización del equipo realizados.',
            ]
        );
    }
}