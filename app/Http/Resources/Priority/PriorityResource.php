<?php

namespace App\Http\Resources\Priority;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriorityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'label' => $this->label,
            'color' => $this->color,
            'description' => $this->description,
            
            // Task statistics when loaded
            'tasks_count' => $this->whenLoaded('tasks', fn() => $this->tasks->count()),
            'tasks_by_status' => $this->whenLoaded('tasks', fn() => [
                'pending' => $this->tasks->where('status', 'pending')->count(),
                'in_progress' => $this->tasks->where('status', 'in_progress')->count(),
                'completed' => $this->tasks->where('status', 'completed')->count(),
            ]),
            
            'timestamps' => [
                'created_at' => $this->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            ],
        ];
    }
}