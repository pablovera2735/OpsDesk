<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Administrador',
            ]
        );

        Role::updateOrCreate(
            ['slug' => 'technician'],
            [
                'name' => 'Técnico',
            ]
        );

        Role::updateOrCreate(
            ['slug' => 'user'],
            [
                'name' => 'Usuario',
            ]
        );
    }
}