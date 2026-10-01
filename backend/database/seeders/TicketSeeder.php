<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@opsdesk.local')->firstOrFail();
        $technician = User::where('email', 'tecnico@opsdesk.local')->firstOrFail();
        $user = User::where('email', 'usuario@opsdesk.local')->firstOrFail();

        $hardware = TicketCategory::where('slug', 'hardware')->firstOrFail();
        $software = TicketCategory::where('slug', 'software')->firstOrFail();
        $redes = TicketCategory::where('slug', 'redes')->firstOrFail();
        $accesos = TicketCategory::where('slug', 'accesos')->firstOrFail();

        $userLaptop = Asset::where('asset_code', 'LAP-001')->firstOrFail();
        $technicianPc = Asset::where('asset_code', 'PC-001')->firstOrFail();
        $adminLaptop = Asset::where('asset_code', 'LAP-002')->firstOrFail();

        Ticket::updateOrCreate(
            ['code' => 'INC-2026-000001'],
            [
                'title' => 'El portátil no tiene conexión a Internet',
                'description' => 'El usuario indica que no puede acceder a Internet desde su portátil.',
                'priority' => 'high',
                'status' => 'open',
                'category_id' => $redes->id,
                'created_by' => $user->id,
                'assigned_to' => $technician->id,
                'asset_id' => $userLaptop->id,
            ]
        );

        Ticket::updateOrCreate(
            ['code' => 'INC-2026-000002'],
            [
                'title' => 'Aplicación de Office no inicia',
                'description' => 'Microsoft Word muestra un error al intentar iniciar la aplicación.',
                'priority' => 'medium',
                'status' => 'in_progress',
                'category_id' => $software->id,
                'created_by' => $user->id,
                'assigned_to' => $technician->id,
                'asset_id' => $userLaptop->id,
            ]
        );

        Ticket::updateOrCreate(
            ['code' => 'INC-2026-000003'],
            [
                'title' => 'Solicitud de acceso a recurso compartido',
                'description' => 'Se solicita acceso a una carpeta compartida del departamento.',
                'priority' => 'low',
                'status' => 'open',
                'category_id' => $accesos->id,
                'created_by' => $user->id,
                'assigned_to' => $technician->id,
                'asset_id' => null,
            ]
        );

        Ticket::updateOrCreate(
            ['code' => 'INC-2026-000004'],
            [
                'title' => 'Equipo con rendimiento bajo',
                'description' => 'El equipo presenta lentitud general durante el uso habitual.',
                'priority' => 'medium',
                'status' => 'resolved',
                'category_id' => $hardware->id,
                'created_by' => $admin->id,
                'assigned_to' => $technician->id,
                'asset_id' => $adminLaptop->id,
            ]
        );

        Ticket::updateOrCreate(
            ['code' => 'INC-2026-000005'],
            [
                'title' => 'Problema con el ordenador del departamento IT',
                'description' => 'El equipo presenta problemas durante el arranque.',
                'priority' => 'high',
                'status' => 'open',
                'category_id' => $hardware->id,
                'created_by' => $technician->id,
                'assigned_to' => $technician->id,
                'asset_id' => $technicianPc->id,
            ]
        );
    }
}