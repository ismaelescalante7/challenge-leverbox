<?php

namespace App\Models;

use Illuminate\Console\View\Components\Task;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Priority extends Model
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
     * Get all tasks for this priority.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get available priority options.
     */
    public static function getAvailablePriorities(): array
    {
        return ['LOW', 'MEDIUM', 'HIGH'];
    }

    /**
     * Get priority color for UI.
     */
    public function getColorAttribute(): string
    {
        return match($this->name) {
            'LOW' => '#10B981',      // green
            'MEDIUM' => '#F59E0B',   // amber
            'HIGH' => '#EF4444',     // red
            default => '#6B7280',    // gray
        };
    }

    /**
     * Get priority label for display.
     */
    public function getLabelAttribute(): string
    {
        return match($this->name) {
            'LOW' => 'Baja',
            'MEDIUM' => 'Media',
            'HIGH' => 'Alta',
            default => $this->name,
        };
    }
}
