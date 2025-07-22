<?php
// app/Repositories/Contracts/TaskRepositoryInterface.php

namespace App\Repositories\Contracts;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

interface TaskRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get tasks by status
     */
    public function getByStatus(string $status): Collection;

    /**
     * Get tasks due on specific date
     */
    public function getByDueDate(string $date): Collection;

    /**
     * Get tasks by priority
     */
    public function getByPriority(int $priorityId): Collection;

    /**
     * Get tasks by tags
     */
    public function getByTags(array $tagIds): Collection;

    /**
     * Sync task tags
     */
    public function syncTags(Task $task, array $tagIds): void;

    /**
     * Update task status
     */
    public function updateStatus(Task $task, string $status): Task;

    /**
     * Search tasks by title or description
     */
    public function search(string $query): Collection;
}