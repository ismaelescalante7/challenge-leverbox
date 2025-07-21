<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Resources\Task\TaskResource;
use App\Http\Resources\Task\TaskCollection;
use App\Models\Task;
use App\Services\TaskService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    use ApiResponseTrait;

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
            
            return $this->collectionResponse(
                new TaskCollection($tasks)
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error retrieving tasks',
                $e->getMessage()
            );
        }
    }

    /**
     * Store a newly created task
     * POST /api/tasks
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        try {
            $task = $this->taskService->createTask($request->validated());

            return $this->createdResponse(
                new TaskResource($task),
                'Task created successfully'
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error creating task',
                $e->getMessage()
            );
        }
    }

    /**
     * Display the specified task
     * GET /api/tasks/{task}
     */
    public function show(Task $task): JsonResponse
    {
        try {
            return $this->resourceResponse(
                new TaskResource($task)
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error retrieving task',
                $e->getMessage()
            );
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

            return $this->updatedResponse(
                new TaskResource($updatedTask),
                'Task updated successfully'
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error updating task',
                $e->getMessage()
            );
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

            return $this->deletedResponse('Task deleted successfully');

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error deleting task',
                $e->getMessage()
            );
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
                new TaskResource($updatedTask),
                'Task status updated successfully'
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
                TaskResource::collection(collect($updatedTasks)),
                'Tasks updated successfully'
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error bulk updating tasks',
                $e->getMessage()
            );
        }
    }
}