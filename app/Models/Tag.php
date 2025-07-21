<?php

namespace App\Models;

use Illuminate\Console\View\Components\Task;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'name' => 'string',
    ];

    /**
     * Get all tasks that have this tag.
     */
    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_tag');
    }

    /**
     * Get available tag options.
     */
    public static function getAvailableTags(): array
    {
        return ['DEV', 'QA', 'HR'];
    }

    /**
     * Get tag color for UI.
     */
    public function getColorAttribute(): string
    {
        return match($this->name) {
            'DEV' => '#3B82F6',      // blue
            'QA' => '#8B5CF6',       // purple
            'HR' => '#EC4899',       // pink
            default => '#6B7280',    // gray
        };
    }

    /**
     * Get tag label for display.
     */
    public function getLabelAttribute(): string
    {
        return match($this->name) {
            'DEV' => 'Desarrollo',
            'QA' => 'Control de Calidad',
            'HR' => 'Recursos Humanos',
            default => $this->name,
        };
    }

    /**
     * Scope to get tags by name.
     */
    public function scopeByName($query, array $names)
    {
        return $query->whereIn('name', $names);
    }
}
