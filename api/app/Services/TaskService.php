<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TaskService
{
    public function __construct(
        protected TaskRepositoryInterface $taskRepository
    ) {}

    /**
     * Get paginated tasks with filters
     */
    public function getPaginatedTasks(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $cleanFilters = $this->sanitizeFilters($filters);
        
        return $this->taskRepository
            ->applyFilters($cleanFilters)
            ->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_direction'] ?? 'desc')
            ->paginate($perPage);
    }

    /**
     * Get all tasks with filters
     */
    public function getTasks(array $filters = []): Collection
    {
        $cleanFilters = $this->sanitizeFilters($filters);
        
        return $this->taskRepository
            ->applyFilters($cleanFilters)
            ->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_direction'] ?? 'desc')
            ->all();
    }

    /**
     * Find task by ID
     */
    public function findTask(int $id): ?Task
    {
        return $this->taskRepository->find($id);
    }

    /**
     * Find task by ID or fail
     */
    public function findTaskOrFail(int $id): Task
    {
        return $this->taskRepository->findOrFail($id);
    }

    /**
     * Create new task
     */
    public function createTask(array $data): Task
    {
        try {
            DB::beginTransaction();

            $tagIds = $data['tag_ids'] ?? [];
            unset($data['tag_ids']);

            $task = $this->taskRepository->create($data);

            if (!empty($tagIds)) {
                $this->taskRepository->syncTags($task, $tagIds);
            }

            DB::commit();
            
            Log::info('Task created', ['task_id' => $task->id, 'title' => $task->title]);

            return $task->fresh(['priority', 'tags']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating task', ['data' => $data, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Update existing task
     */
    public function updateTask(Task $task, array $data): Task
    {
        try {
            DB::beginTransaction();

            $tagIds = $data['tag_ids'] ?? null;
            unset($data['tag_ids']);

            $updatedTask = $this->taskRepository->update($task, $data);

            if ($tagIds !== null) {
                $this->taskRepository->syncTags($updatedTask, $tagIds);
            }

            DB::commit();
            
            Log::info('Task updated', ['task_id' => $updatedTask->id]);

            return $updatedTask->fresh(['priority', 'tags']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating task', ['task_id' => $task->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Delete task
     */
    public function deleteTask(Task $task): bool
    {
        try {
            $result = $this->taskRepository->delete($task);
            
            Log::info('Task deleted', ['task_id' => $task->id]);
            
            return $result;

        } catch (\Exception $e) {
            Log::error('Error deleting task', ['task_id' => $task->id, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Update task status
     */
    public function updateTaskStatus(Task $task, string $status): Task
    {
        $this->validateStatus($status);

        try {
            $updatedTask = $this->taskRepository->updateStatus($task, $status);
            
            Log::info('Task status updated', ['task_id' => $task->id, 'status' => $status]);

            return $updatedTask->fresh(['priority', 'tags']);

        } catch (\Exception $e) {
            Log::error('Error updating task status', [
                'task_id' => $task->id,
                'status' => $status,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Search tasks
     */
    public function searchTasks(string $query): Collection
    {
        return $this->taskRepository->search($query);
    }

    /**
     * Get tasks by status
     */
    public function getTasksByStatus(string $status): Collection
    {
        $this->validateStatus($status);
        return $this->taskRepository->getByStatus($status);
    }

    /**
     * Mark task as completed
     */
    public function markAsCompleted(Task $task): Task
    {
        return $this->updateTaskStatus($task, 'completed');
    }

    /**
     * Mark task as in progress
     */
    public function markAsInProgress(Task $task): Task
    {
        return $this->updateTaskStatus($task, 'in_progress');
    }

    /**
     * Mark task as pending
     */
    public function markAsPending(Task $task): Task
    {
        return $this->updateTaskStatus($task, 'pending');
    }

    /**
     * Get tasks count
     */
    public function getTasksCount(array $filters = []): int
    {
        return $this->taskRepository->applyFilters($this->sanitizeFilters($filters))->count();
    }

    /**
     * Validate task status
     */
    protected function validateStatus(string $status): void
    {
        if (!in_array($status, Task::getAvailableStatuses())) {
            throw new \InvalidArgumentException("Invalid status: {$status}");
        }
    }

    /**
     * Sanitize and validate filters
     */
    protected function sanitizeFilters(array $filters): array
    {
        $cleanFilters = [];

        // Status filter
        if (isset($filters['status']) && in_array($filters['status'], Task::getAvailableStatuses())) {
            $cleanFilters['status'] = $filters['status'];
        }

        // Due date filter
        if (isset($filters['due_date']) && !empty($filters['due_date'])) {
            try {
                $date = \Carbon\Carbon::parse($filters['due_date']);
                $cleanFilters['due_date'] = $date->format('Y-m-d');
            } catch (\Exception $e) {
                // Ignore invalid date
            }
        }

        // Priority filter
        if (isset($filters['priority_id']) && is_numeric($filters['priority_id'])) {
            $cleanFilters['priority_id'] = (int) $filters['priority_id'];
        }

        // Tags filter
        if (isset($filters['tag_ids'])) {
            $tagIds = is_array($filters['tag_ids']) ? $filters['tag_ids'] : explode(',', $filters['tag_ids']);
            $tagIds = array_filter(array_map('intval', $tagIds));
            if (!empty($tagIds)) {
                $cleanFilters['tag_ids'] = $tagIds;
            }
        }

        // Search filter
        if (isset($filters['search']) && !empty(trim($filters['search']))) {
            $cleanFilters['search'] = trim($filters['search']);
        }

        return $cleanFilters;
    }
}