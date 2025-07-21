<?php

namespace App\Http\Resources\Task;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TaskCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'pagination' => [
                'current_page' => $this->currentPage(),
                'from' => $this->firstItem(),
                'last_page' => $this->lastPage(),
                'per_page' => $this->perPage(),
                'to' => $this->lastItem(),
                'total' => $this->total(),
                'has_more_pages' => $this->hasMorePages(),
            ],
            'links' => [
                'first' => $this->url(1),
                'last' => $this->url($this->lastPage()),
                'prev' => $this->previousPageUrl(),
                'next' => $this->nextPageUrl(),
                'current' => $this->url($this->currentPage()),
            ],
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'filters' => [
                'available_statuses' => [
                    ['value' => 'pending', 'label' => 'Pendiente'],
                    ['value' => 'in_progress', 'label' => 'En Progreso'],
                    ['value' => 'completed', 'label' => 'Completada'],
                ],
                'sort_options' => [
                    ['value' => 'title', 'label' => 'Título'],
                    ['value' => 'status', 'label' => 'Estado'],
                    ['value' => 'due_date', 'label' => 'Fecha de Vencimiento'],
                    ['value' => 'created_at', 'label' => 'Fecha de Creación'],
                    ['value' => 'updated_at', 'label' => 'Última Actualización'],
                ],
                'sort_directions' => [
                    ['value' => 'asc', 'label' => 'Ascendente'],
                    ['value' => 'desc', 'label' => 'Descendente'],
                ],
            ],
            'meta' => [
                'timestamp' => now()->toISOString(),
                'applied_filters' => $request->only([
                    'status', 'due_date', 'priority_id', 'tag_ids', 'overdue', 'search'
                ]),
            ],
        ];
    }
}