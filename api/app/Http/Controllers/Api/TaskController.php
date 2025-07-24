<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Resources\Task\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{

    public function __construct(
        protected TaskService $taskService
    ) {}
    

    /**
     * Display a listing of tasks
     * GET /api/tasks
     */
    public function index(Request $request)
    {
        try {
            $perPage = min($request->get('per_page', 15), 100);
            $filters = $request->only([
                'status', 'due_date', 'priority_id', 'tag_ids', 'overdue', 'search',
                'sort_by', 'sort_direction'
            ]);

            $tasks = $this->taskService->getPaginatedTasks($filters, $perPage);
            
            return TaskResource::collection($tasks);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error retrieving tasks: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Store a newly created task
     * POST /api/tasks
     */
    public function store(StoreTaskRequest $request)
    {
        $task = $this->taskService->createTask($request->validated());
        return response()->json(TaskResource::make($task), 201);
    }

    /**
     * Display the specified task
     * GET /api/tasks/{task}
     */
    public function show(Task $task): JsonResponse
    {
        try {
            return response()->json(TaskResource::make($task),201);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error show task: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified task
     * PUT/PATCH /api/tasks/{task}
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        try {
            $updatedTask = $this->taskService->updateTask($task, $request->validated());

            return response()->json(TaskResource::make($updatedTask), 200);
        
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error update task: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified task
     * DELETE /api/tasks/{task}
     */
    public function destroy(Task $task): JsonResponse
    {
        try {
            $this->taskService->deleteTask($task);

            return response()->json(null, 200);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error deleting task: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update task status
     * PATCH /api/tasks/{task}/status
     */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        try {
            $updatedTask = $this->taskService->updateTaskStatus($task, $request->status);

            return response()->json(
                TaskResource::make($updatedTask),
                200
            );

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error updating task status: ' . $e->getMessage()], 500);
        }
    }

}