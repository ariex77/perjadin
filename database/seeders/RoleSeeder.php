<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // List permission untuk project e-perjadin (diselaraskan dengan routes)
        $permissions = [
            // Dashboard permissions
            'access dashboard',
            
            // Master permissions
            'manage work-units',
            'manage employees',
            'manage fullboard-prices',
            
            // Report permissions
            'view reports',
            'generate reports',
            'review reports',
            'manage in-city-reports',
            'manage out-city-reports', 
            'manage travel-reports',
            
            // Assignment permissions
            'manage assignments',
            'manage assignment-documentations',
            'view assignment-employees',
            'bulk-delete assignments',
            'bulk-delete work-units',
            'bulk-delete employees',
            'bulk-delete fullboard-prices',
            
            // System permissions
            'manage roles',
            'manage permissions',
            
            // Settings permissions
            'manage profile',
            'manage password',
            'manage appearance',
        ];

        // Buat permission
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $superadminRole = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $verificatorRole = Role::firstOrCreate(['name' => 'verificator', 'guard_name' => 'web']);
        $leaderRole = Role::firstOrCreate(['name' => 'leader', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        // Berikan semua permission ke Superadmin
        $superadminRole->syncPermissions(Permission::pluck('name'));

        // Admin permissions - bisa manage semua kecuali system
        $adminPermissions = [
            'access dashboard',
            'manage work-units',
            'manage employees',
            'manage fullboard-prices',
            'view reports',
            'generate reports',
            'manage profile',
            'manage password',
            'manage appearance',
        ];
        // Admin: manage master data, assignments, and reports
        $adminPermissions = array_merge($adminPermissions, [
            'manage assignments',
            'manage assignment-documentations',
            'view assignment-employees',
            'review reports',
        ]);
        $adminRole->syncPermissions($adminPermissions);

        // Verifikator permissions - bisa review semua laporan
        $verificatorPermissions = [
            'access dashboard',
            'generate reports',
            'review reports',
            'manage profile',
            'manage password',
            'manage appearance',
        ];
        $verificatorRole->syncPermissions($verificatorPermissions);

        // Leader permissions - tidak bisa akses data master
        $leaderPermissions = [
            'access dashboard',
            'view reports',
            'generate reports',
            'review reports',
            'manage in-city-reports',
            'manage out-city-reports',
            'manage travel-reports',
            'manage assignments',
            'manage assignment-documentations',
            'view assignment-employees',
            'manage profile',
            'manage password',
            'manage appearance',
        ];
        $leaderRole->syncPermissions($leaderPermissions);

        // Employee permissions - hanya bisa view
        $employeePermissions = [
            'access dashboard',
            'view reports',
            'manage profile',
            'manage password',
            'manage appearance',
        ];
        $employeeRole->syncPermissions($employeePermissions);

        // Assign role ke user yang sudah ada sesuai requirement
        
        // 1. Rachel Ginting sebagai superadmin
        $rachel = User::where('email', 'rachelginting@example.com')->first();
        if ($rachel) {
            $rachel->assignRole($superadminRole);
        }

        // 2. Admin 1-5 sebagai admin
        for ($i = 1; $i <= 5; $i++) {
            $admin = User::where('email', "admin$i@example.com")->first();
            if ($admin) {
                $admin->assignRole($adminRole);
            }
        }

        // 3. Leader 1-4 sebagai leader (sudah ada 4 leader dari work unit)
        for ($i = 1; $i <= 4; $i++) {
            $n = str_pad($i, 2, '0', STR_PAD_LEFT);
            $leader = User::where('email', "leader$n@example.com")->first();
            if ($leader) {
                $leader->assignRole($leaderRole);
            }
        }

        // 4. Verifikator - hanya 1 saja
        $verificator = User::where('email', "verificator@example.com")->first();
        if ($verificator) {
            $verificator->assignRole($verificatorRole);
        }

        // 5. Employee 1-10 sebagai employee (hanya view)
        for ($i = 1; $i <= 10; $i++) {
            $employee = User::where('email', "employee$i@example.com")->first();
            if ($employee) {
                $employee->assignRole($employeeRole);
            }
        }
    }
}
