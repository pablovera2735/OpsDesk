<?php

namespace Database\Seeders;

use App\Models\TicketCategory;
use Illuminate\Database\Seeder;

class TicketCategorySeeder extends Seeder
{
    public function run(): void
    {
        TicketCategory::updateOrCreate(
            ['slug' => 'hardware'],
            [
                'name' => 'Hardware',
                'description' => 'Ordenadores, portátiles, monitores y otros dispositivos.',
                'active' => true,
            ]
        );

        TicketCategory::updateOrCreate(
            ['slug' => 'software'],
            [
                'name' => 'Software',
                'description' => 'Problemas relacionados con aplicaciones y programas.',
                'active' => true,
            ]
        );

        TicketCategory::updateOrCreate(
            ['slug' => 'redes'],
            [
                'name' => 'Redes',
                'description' => 'Problemas de red, Internet, WiFi, VPN y conectividad.',
                'active' => true,
            ]
        );

        TicketCategory::updateOrCreate(
            ['slug' => 'accesos'],
            [
                'name' => 'Accesos',
                'description' => 'Problemas con cuentas, contraseñas y permisos.',
                'active' => true,
            ]
        );

        TicketCategory::updateOrCreate(
            ['slug' => 'microsoft-365'],
            [
                'name' => 'Microsoft 365',
                'description' => 'Incidencias relacionadas con Microsoft 365.',
                'active' => true,
            ]
        );

        TicketCategory::updateOrCreate(
            ['slug' => 'seguridad'],
            [
                'name' => 'Seguridad',
                'description' => 'Incidentes y consultas relacionadas con seguridad informática.',
                'active' => true,
            ]
        );

        TicketCategory::updateOrCreate(
            ['slug' => 'impresoras'],
            [
                'name' => 'Impresoras',
                'description' => 'Problemas con impresoras y dispositivos de impresión.',
                'active' => true,
            ]
        );

        TicketCategory::updateOrCreate(
            ['slug' => 'otros'],
            [
                'name' => 'Otros',
                'description' => 'Incidencias que no pertenecen a otra categoría.',
                'active' => true,
            ]
        );
    }
}