<?php
// app/Repositories/TaskRepository.php

namespace App\Repositories;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository extends BaseRepository implements TaskRepositoryInterface
{
    public function __construct(Task $model)
    {
        parent::__construct($model);
    }

    /**
     * Get tasks by status
     */
    public function getByStatus(string $status): Collection
    {
        return $this->model->byStatus($status)->get();
    }

    /**
     * Get overdue tasks
     */
    public function getOverdue(): Collection
    {
        return $this->model->overdue()->get();
    }

    /**
     * Get tasks due on specific date
     */
    public function getByDueDate(string $date): Collection
    {
        return $this->model->byDueDate($date)->get();
    }

    /**
     * Get tasks by priority
     */
    public function getByPriority(int $priorityId): Collection
    {
        return $this->model->byPriority($priorityId)->get();
    }

    /**
     * Get tasks by tags
     */
    public function getByTags(array $tagIds): Collection
    {
        return $this->model->byTags($tagIds)->get();
    }

    /**
     * Sync task tags
     */
    public function syncTags(Task $task, array $tagIds): void
    {
        $task->tags()->sync($tagIds);
    }

    /**
     * Update task status
     */
    public function updateStatus(Task $task, string $status): Task
    {
        $task->update(['status' => $status]);
        return $task->fresh();
    }

    /**
     * Search tasks by title or description
     */
    public function search(string $query): Collection
    {
        return $this->model
            ->where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->get();
    }

    /**
     * Apply custom filters for tasks
     */
    protected function applyFilter(string $field, mixed $value): void
    {
        match ($field) {
            'status' => $this->query->byStatus($value),
            'due_date' => $this->query->byDueDate($value),
            'priority_id' => $this->query->byPriority($value),
            'tag_ids' => $this->query->byTags(is_array($value) ? $value : explode(',', $value)),
            'overdue' => $value ? $this->query->overdue() : null,
            'search' => $this->query->where(function ($q) use ($value) {
                $q->where('title', 'like', "%{$value}%")
                  ->orWhere('description', 'like', "%{$value}%");
            }),
            default => parent::applyFilter($field, $value),
        };
    }
}