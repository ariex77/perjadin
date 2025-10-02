<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentEmployee;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssignmentEmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::whereDoesntHave('roles', function ($query) {
            $query->whereIn('name', ['admin', 'superadmin']);
        })->get();

        $assignments = Assignment::all();

        if ($users->isEmpty() || $assignments->isEmpty()) {
            return;
        }

        // Clear existing assignment employees
        AssignmentEmployee::truncate();

        foreach ($assignments as $assignment) {
            // Assign 1-3 random users to each assignment
            $randomUsers = $users->random(rand(1, min(3, $users->count())));
            
            foreach ($randomUsers as $user) {
                AssignmentEmployee::create([
                    'assignment_id' => $assignment->id,
                    'user_id' => $user->id,
                ]);
            }
        }
    }
}
