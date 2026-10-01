<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@opsdesk.local')->firstOrFail();
        $technician = User::where('email', 'tecnico@opsdesk.local')->firstOrFail();
        $user = User::where('email', 'usuario@opsdesk.local')->firstOrFail();

        $itDepartment = Department::where('code', 'IT')->firstOrFail();
        $adminDepartment = Department::where('code', 'ADM')->firstOrFail();

        Asset::updateOrCreate(
            ['asset_code' => 'LAP-001'],
            [
                'hostname' => 'LAP-PABLO',
                'type' => 'Laptop',
                'brand' => 'Dell',
                'model' => 'Latitude 5440',
                'serial_number' => 'DL001OPS2026',
                'operating_system' => 'Windows 11 Pro',
                'ip_address' => '192.168.1.101',
                'mac_address' => '00:11:22:33:44:01',
                'status' => 'active',
                'assigned_user_id' => $user->id,
                'department_id' => $adminDepartment->id,
            ]
        );

        Asset::updateOrCreate(
            ['asset_code' => 'PC-001'],
            [
                'hostname' => 'PC-IT-001',
                'type' => 'Desktop',
                'brand' => 'HP',
                'model' => 'ProDesk 600',
                'serial_number' => 'HP001OPS2026',
                'operating_system' => 'Windows 11 Pro',
                'ip_address' => '192.168.1.102',
                'mac_address' => '00:11:22:33:44:02',
                'status' => 'active',
                'assigned_user_id' => $technician->id,
                'department_id' => $itDepartment->id,
            ]
        );

        Asset::updateOrCreate(
            ['asset_code' => 'LAP-002'],
            [
                'hostname' => 'LAP-ADMIN',
                'type' => 'Laptop',
                'brand' => 'Lenovo',
                'model' => 'ThinkPad E14',
                'serial_number' => 'LN002OPS2026',
                'operating_system' => 'Windows 11 Pro',
                'ip_address' => '192.168.1.103',
                'mac_address' => '00:11:22:33:44:03',
                'status' => 'active',
                'assigned_user_id' => $admin->id,
                'department_id' => $itDepartment->id,
            ]
        );

        Asset::updateOrCreate(
            ['asset_code' => 'SRV-001'],
            [
                'hostname' => 'SRV-OPS-001',
                'type' => 'Server',
                'brand' => 'Dell',
                'model' => 'PowerEdge R550',
                'serial_number' => 'DL003OPS2026',
                'operating_system' => 'Ubuntu Server 24.04',
                'ip_address' => '192.168.1.10',
                'mac_address' => '00:11:22:33:44:04',
                'status' => 'active',
                'assigned_user_id' => null,
                'department_id' => $itDepartment->id,
            ]
        );
    }
}