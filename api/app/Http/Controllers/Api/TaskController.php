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
use Illuminate\Validation\ValidationException;

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
            return response()->json(['message' => "Error server"], 500);
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
            return response()->json(['message' => "Error server"], 500);
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
            return response()->json(['message' => "Error server"], 500);
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
            return response()->json(['message' => "Error server"], 500);
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

            return $this->updatedResponse(
                new TaskResource($updatedTask)
            );

        } catch (\InvalidArgumentException $e) {
            return $this->validationErrorResponse(
                ['status' => [$e->getMessage()]],
                'Invalid status provided'
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error updating task status',
                $e->getMessage()
            );
        }
    }

    /**
     * Search tasks
     * GET /api/tasks/search
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:255'
        ]);

        try {
            $tasks = $this->taskService->searchTasks($request->q);

            return $this->successResponse(
                TaskResource::collection($tasks)
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error searching tasks',
                $e->getMessage()
            );
        }
    }

    /**
     * Get tasks by status
     * GET /api/tasks/status/{status}
     */
    public function byStatus(string $status): JsonResponse
    {
        try {
            $tasks = $this->taskService->getTasksByStatus($status);

            return $this->successResponse(
                TaskResource::collection($tasks),
                "Tasks with status '{$status}' retrieved successfully"
            );

        } catch (\InvalidArgumentException $e) {
            return $this->validationErrorResponse(
                ['status' => [$e->getMessage()]],
                'Invalid status provided'
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error retrieving tasks by status',
                $e->getMessage()
            );
        }
    }


    /**
     * Bulk update tasks
     * PATCH /api/tasks/bulk
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'task_ids' => 'required|array|min:1',
            'task_ids.*' => 'integer|exists:tasks,id',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority_id' => 'sometimes|exists:priorities,id',
        ]);

        try {
            $updatedTasks = [];
            $taskIds = $request->task_ids;
            
            foreach ($taskIds as $taskId) {
                $task = $this->taskService->findTaskOrFail($taskId);
                $updateData = $request->only(['status', 'priority_id']);
                
                if (!empty($updateData)) {
                    $updatedTask = $this->taskService->updateTask($task, $updateData);
                    $updatedTasks[] = $updatedTask;
                }
            }

            return $this->updatedResponse(
                TaskResource::collection(collect($updatedTasks))
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error bulk updating tasks',
                $e->getMessage()
            );
        }
    }
}