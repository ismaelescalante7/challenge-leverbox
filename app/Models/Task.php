<?php
// app/Models/Task.php (Laravel 12)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

#[ObservedBy([\App\Observers\TaskObserver::class])]
class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'due_date',
        'priority_id'
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => 'string',
        ];
    }

    /**
     * The relationships that should always be loaded.
     */
    protected $with = ['priority', 'tags'];

    /**
     * Get the priority that owns the task.
     */
    public function priority(): BelongsTo
    {
        return $this->belongsTo(Priority::class);
    }

    /**
     * Get all tags for this task.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'task_tag');
    }

    /**
     * Get available status options.
     */
    public static function getAvailableStatuses(): array
    {
        return ['pending', 'in_progress', 'completed'];
    }

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by due date.
     */
    public function scopeByDueDate($query, string $date)
    {
        return $query->whereDate('due_date', $date);
    }

    /**
     * Scope to get overdue tasks.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', Carbon::today())
                    ->where('status', '!=', 'completed');
    }

    /**
     * Scope to filter by priority.
     */
    public function scopeByPriority($query, int $priorityId)
    {
        return $query->where('priority_id', $priorityId);
    }

    /**
     * Scope to filter by tags.
     */
    public function scopeByTags($query, array $tagIds)
    {
        return $query->whereHas('tags', function ($q) use ($tagIds) {
            $q->whereIn('tags.id', $tagIds);
        });
    }

    /**
     * Scope for pending tasks.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for in progress tasks.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope for completed tasks.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Check if the task is overdue.
     */
    protected function isOverdue(): Attribute
    {
        return Attribute::make(
            get: function (): bool {
                if (!$this->due_date) {
                    return false;
                }
                
                return $this->due_date->isPast() && $this->status !== 'completed';
            }
        );
    }

    /**
     * Get status label for display.
     */
    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn(): string => match($this->status) {
                'pending' => 'Pendiente',
                'in_progress' => 'En Progreso',
                'completed' => 'Completada',
                default => $this->status,
            }
        );
    }

    /**
     * Get status color for UI.
     */
    protected function statusColor(): Attribute
    {
        return Attribute::make(
            get: fn(): string => match($this->status) {
                'pending' => '#6B7280',      // gray
                'in_progress' => '#F59E0B',  // amber
                'completed' => '#10B981',    // green
                default => '#6B7280',        // gray
            }
        );
    }

    /**
     * Get days until due date.
     */
    protected function daysUntilDue(): Attribute
    {
        return Attribute::make(
            get: function (): ?int {
                if (!$this->due_date) {
                    return null;
                }

                return Carbon::today()->diffInDays($this->due_date, false);
            }
        );
    }

    /**
     * Get formatted due date.
     */
    protected function formattedDueDate(): Attribute
    {
        return Attribute::make(
            get: fn(): ?string => $this->due_date?->format('d/m/Y')
        );
    }
}