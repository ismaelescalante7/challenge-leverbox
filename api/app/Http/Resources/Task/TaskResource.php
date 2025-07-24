<?php

namespace App\Http\Resources\Task;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,

            'status' => [
                'value' => $this->status,
                'label' => $this->status_label,
                'color' => $this->status_color,
            ],

            'dates' => [
                'due_date' => optional($this->due_date)->format('Y-m-d'),
                'formatted_due_date' => $this->formatted_due_date,
                'days_until_due' => $this->days_until_due,
                'is_overdue' => $this->is_overdue,
                'created_at' => $this->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            ],

            'priority' => [
                'id' => optional($this->priority)->id,
                'name' => optional($this->priority)->name,
                'label' => optional($this->priority)->label,
                'color' => optional($this->priority)->color,
            ],

            'tags' => $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'label' => $tag->label,
                    'color' => $tag->color,
                ];
            }),

            'meta' => [
                'can_edit' => $this->status !== 'completed',
                'urgency_level' => $this->getUrgencyLevel(),
            ],
        ];
    }

    protected function getUrgencyLevel(): string
    {
        $priority = optional($this->priority)->name;

        if ($this->is_overdue && $priority === 'HIGH') {
            return 'critical';
        }

        if ($this->is_overdue || $priority === 'HIGH') {
            return 'high';
        }

        if ($priority === 'MEDIUM' && $this->days_until_due <= 3) {
            return 'medium';
        }

        return 'low';
    }

    public function with($request): array
    {
        return [
            'meta' => [
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}