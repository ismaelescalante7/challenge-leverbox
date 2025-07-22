<?php

namespace Database\Seeders;

use App\Models\Priority;
use App\Models\Tag;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener las prioridades y etiquetas existentes
        $priorityLow = Priority::where('name', 'LOW')->first();
        $priorityMedium = Priority::where('name', 'MEDIUM')->first();
        $priorityHigh = Priority::where('name', 'HIGH')->first();

        $tagDev = Tag::where('name', 'DEV')->first();
        $tagQa = Tag::where('name', 'QA')->first();
        $tagHr = Tag::where('name', 'HR')->first();

        // Tareas de ejemplo
        $tasks = [
            [
                'title' => 'Implement user authentication system',
                'description' => 'Develop a complete authentication system with login, register, and JWT token management.',
                'status' => 'in_progress',
                'due_date' => Carbon::now()->addDays(7),
                'priority_id' => $priorityHigh->id,
                'tags' => [$tagDev->id]
            ],
            [
                'title' => 'Create API documentation',
                'description' => 'Write comprehensive API documentation using Swagger/OpenAPI for all endpoints.',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(10),
                'priority_id' => $priorityMedium->id,
                'tags' => [$tagDev->id, $tagQa->id]
            ],
            [
                'title' => 'Conduct integration tests',
                'description' => 'Create and execute integration tests for the REST API endpoints.',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(5),
                'priority_id' => $priorityHigh->id,
                'tags' => [$tagQa->id]
            ],
            [
                'title' => 'Hire frontend developer',
                'description' => 'Review CVs and conduct technical interviews for a new frontend developer position.',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(14),
                'priority_id' => $priorityLow->id,
                'tags' => [$tagHr->id]
            ],
            [
                'title' => 'Optimize database queries',
                'description' => 'Review and improve the performance of slow database queries in the application.',
                'status' => 'completed',
                'due_date' => Carbon::now()->subDays(2),
                'priority_id' => $priorityHigh->id,
                'tags' => [$tagDev->id]
            ],
            [
                'title' => 'Setup CI/CD pipeline',
                'description' => 'Configure automated testing and deployment pipeline using GitHub Actions.',
                'status' => 'in_progress',
                'due_date' => Carbon::now()->addDays(8),
                'priority_id' => $priorityMedium->id,
                'tags' => [$tagDev->id, $tagQa->id]
            ],
            [
                'title' => 'Code review guidelines',
                'description' => 'Create documentation for code review process and best practices.',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(12),
                'priority_id' => $priorityLow->id,
                'tags' => [$tagDev->id]
            ],
            [
                'title' => 'Performance testing',
                'description' => 'Execute load and stress tests to ensure application performance under high traffic.',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(6),
                'priority_id' => $priorityMedium->id,
                'tags' => [$tagQa->id, $tagDev->id]
            ],
            [
                'title' => 'Update employee handbook',
                'description' => 'Review and update the company employee handbook with new policies.',
                'status' => 'in_progress',
                'due_date' => Carbon::now()->addDays(20),
                'priority_id' => $priorityLow->id,
                'tags' => [$tagHr->id]
            ],
            [
                'title' => 'Security audit',
                'description' => 'Conduct a comprehensive security audit of the application and infrastructure.',
                'status' => 'pending',
                'due_date' => Carbon::now()->addDays(15),
                'priority_id' => $priorityHigh->id,
                'tags' => [$tagDev->id, $tagQa->id]
            ]
        ];

        foreach ($tasks as $taskData) {
            // Crear la tarea
            $task = Task::create([
                'title' => $taskData['title'],
                'description' => $taskData['description'],
                'status' => $taskData['status'],
                'due_date' => $taskData['due_date'],
                'priority_id' => $taskData['priority_id'],
            ]);

            // Asignar las etiquetas
            $task->tags()->attach($taskData['tags']);
        }
    }
}
