<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->firstOrFail();
        $technicianRole = Role::where('slug', 'technician')->firstOrFail();
        $userRole = Role::where('slug', 'user')->firstOrFail();

        $itDepartment = Department::where('code', 'IT')->firstOrFail();
        $adminDepartment = Department::where('code', 'ADM')->firstOrFail();

        User::updateOrCreate(
            ['email' => 'admin@opsdesk.local'],
            [
                'name' => 'Administrador OpsDesk',
                'password' => 'Admin123!',
                'role_id' => $adminRole->id,
                'department_id' => $itDepartment->id,
                'active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'tecnico@opsdesk.local'],
            [
                'name' => 'Técnico IT',
                'password' => 'Tecnico123!',
                'role_id' => $technicianRole->id,
                'department_id' => $itDepartment->id,
                'active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'usuario@opsdesk.local'],
            [
                'name' => 'Usuario Demo',
                'password' => 'Usuario123!',
                'role_id' => $userRole->id,
                'department_id' => $adminDepartment->id,
                'active' => true,
            ]
        );
    }
}