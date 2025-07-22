<?php

namespace App\Http\Resources\Task;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            
            // Status information
            'status' => [
                'value' => $this->status,
                'label' => $this->status_label,
                'color' => $this->status_color,
            ],
            
            // Date information
            'dates' => [
                'due_date' => $this->due_date?->format('Y-m-d'),
                'formatted_due_date' => $this->formatted_due_date,
                'days_until_due' => $this->days_until_due,
                'is_overdue' => $this->is_overdue,
                'created_at' => $this->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            ],
            
            // Priority information
            'priority' => [
                'id' => $this->priority->id,
                'name' => $this->priority->name,
                'label' => $this->priority->label,
                'color' => $this->priority->color,
            ],
            
            // Tags information
            'tags' => $this->tags->map(fn($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'label' => $tag->label,
                'color' => $tag->color,
            ]),
            
            // Additional metadata
            'meta' => [
                'can_edit' => $this->status !== 'completed',
                'urgency_level' => $this->getUrgencyLevel(),
            ],
        ];
    }

    /**
     * Get urgency level based on priority and due date
     */
    protected function getUrgencyLevel(): string
    {
        if ($this->is_overdue && $this->priority->name === 'HIGH') {
            return 'critical';
        }
        
        if ($this->is_overdue || $this->priority->name === 'HIGH') {
            return 'high';
        }
        
        if ($this->priority->name === 'MEDIUM' && $this->days_until_due <= 3) {
            return 'medium';
        }
        
        return 'low';
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}