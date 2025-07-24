<?php

namespace Tests\Feature\Api;

use App\Models\Task;
use App\Models\Priority;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_tasks()
    {
        Task::factory()->count(3)->create();

        $response = $this->getJson('/api/tasks');

        $response->assertOk()
                 ->assertJsonStructure(['data', 'meta']);
    }

    /** @test */
    public function it_can_create_a_task()
    {
        $priority = Priority::factory()->create();

        $data = [
            'title' => 'Test Task',
            'description' => 'Test description',
            'status' => 'pending',
            'due_date' => now()->addDays(3)->toDateString(),
            'priority_id' => $priority->id,
        ];

        $response = $this->postJson('/api/tasks', $data);

        $response->assertCreated()
                 ->assertJsonPath('title', 'Test Task');

        $this->assertDatabaseHas('tasks', ['title' => 'Test Task']);
    }

    /** @test */
    public function it_can_show_a_task()
    {
        $task = Task::factory()->create();

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertCreated()
                 ->assertJsonPath('id', $task->id);
    }

    /** @test */
    public function it_can_update_a_task()
    {
        $task = Task::factory()->create();
        $priority = Priority::factory()->create();

        $updateData = [
            'title' => 'Updated Task Title',
            'description' => 'Updated desc',
            'status' => 'in_progress',
            'due_date' => now()->addDays(5)->toDateString(),
            'priority_id' => $priority->id,
        ];

        $response = $this->putJson("/api/tasks/{$task->id}", $updateData);

        $response->assertOk()
                 ->assertJsonPath('title', 'Updated Task Title');
    }

    /** @test */
    public function it_can_delete_a_task()
    {
        $task = Task::factory()->create();

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    /** @test */
    public function it_can_update_status_of_task()
    {
        $task = Task::factory()->create(['status' => 'pending']);

        $response = $this->patchJson("/api/tasks/{$task->id}/status", [
            'status' => 'completed'
        ]);
        $response->assertOk()
                 ->assertJsonPath('status.value', 'completed');
    }

    /** @test */
    public function it_can_filter_tasks_by_status()
    {
        Task::factory()->create(['status' => 'pending']);
        Task::factory()->create(['status' => 'completed']);

        $response = $this->getJson('/api/tasks?status=completed');

        $response->assertOk()
                ->assertJsonCount(1, 'data')
                ->assertJsonPath('data.0.status.value', 'completed');
    }
    
    /** @test */
    public function it_returns_500_when_task_service_fails()
    {
        // Simula un fallo
        $this->mock(\App\Services\TaskService::class, function ($mock) {
            $mock->shouldReceive('getPaginatedTasks')->andThrow(new \Exception("Service failure"));
        });

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(500)
                 ->assertJsonPath('error', fn($e) => str_contains($e, 'Service failure'));
    }
}
