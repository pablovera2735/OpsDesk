<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        Department::updateOrCreate(
            ['code' => 'IT'],
            [
                'name' => 'Tecnología',
                'active' => true,
            ]
        );

        Department::updateOrCreate(
            ['code' => 'RRHH'],
            [
                'name' => 'Recursos Humanos',
                'active' => true,
            ]
        );

        Department::updateOrCreate(
            ['code' => 'ADM'],
            [
                'name' => 'Administración',
                'active' => true,
            ]
        );

        Department::updateOrCreate(
            ['code' => 'FIN'],
            [
                'name' => 'Finanzas',
                'active' => true,
            ]
        );

        Department::updateOrCreate(
            ['code' => 'MKT'],
            [
                'name' => 'Marketing',
                'active' => true,
            ]
        );
    }
}