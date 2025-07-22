<?php
// app/Observers/TaskObserver.php (Laravel 12)

namespace App\Observers;

use App\Models\Task;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TaskObserver
{
    /**
     * Handle the Task "creating" event.
     */
    public function creating(Task $task): void
    {
        Log::info('Creating new task', ['title' => $task->title]);
    }

    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        Log::info('Task created successfully', [
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status
        ]);
        
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        $changes = $task->getChanges();
        
        Log::info('Task updated', [
            'id' => $task->id,
            'changes' => $changes
        ]);
        
        // Log status changes specifically
        if (isset($changes['status'])) {
            Log::info('Task status changed', [
                'id' => $task->id,
                'old_status' => $task->getOriginal('status'),
                'new_status' => $changes['status']
            ]);
        }
        
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        Log::info('Task deleted', [
            'id' => $task->id,
            'title' => $task->title
        ]);
        
    }

    /**
     * Handle the Task "restored" event.
     */
    public function restored(Task $task): void
    {
        Log::info('Task restored', ['id' => $task->id]);
    }

    /**
     * Handle the Task "force deleted" event.
     */
    public function forceDeleted(Task $task): void
    {
        Log::info('Task force deleted', ['id' => $task->id]);
    }

}