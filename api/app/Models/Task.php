<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

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
     * The attributes that should be cast.
     */
    protected $casts = [
        'due_date' => 'date',
        'status' => 'string',
    ];

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
     * Available status options.
     */
    public static function getAvailableStatuses(): array
    {
        return ['pending', 'in_progress', 'completed'];
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDueDate($query, string $date)
    {
        return $query->whereDate('due_date', $date);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', Carbon::today())
                     ->where('status', '!=', 'completed');
    }

    public function scopeByPriority($query, int $priorityId)
    {
        return $query->where('priority_id', $priorityId);
    }

    public function scopeByTags($query, array $tagIds)
    {
        return $query->whereHas('tags', function ($q) use ($tagIds) {
            $q->whereIn('tags.id', $tagIds);
        });
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Computed: is_overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        if (!$this->due_date) {
            return false;
        }

        return $this->due_date->isPast() && $this->status !== 'completed';
    }

    /**
     * Computed: status_label
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Pendiente',
            'in_progress' => 'En Progreso',
            'completed' => 'Completada',
            default => $this->status,
        };
    }

    /**
     * Computed: status_color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => '#6B7280',
            'in_progress' => '#F59E0B',
            'completed' => '#10B981',
            default => '#6B7280',
        };
    }

    /**
     * Computed: days_until_due
     */
    public function getDaysUntilDueAttribute(): ?int
    {
        if (!$this->due_date) {
            return null;
        }

        return Carbon::today()->diffInDays($this->due_date, false);
    }

    /**
     * Computed: formatted_due_date
     */
    public function getFormattedDueDateAttribute(): ?string
    {
        return $this->due_date ? $this->due_date->format('d/m/Y') : null;
    }
}