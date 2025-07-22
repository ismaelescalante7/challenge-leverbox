<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Priority;
use App\Http\Resources\Priority\PriorityResource;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PriorityController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a listing of priorities.
     */
    public function index(): JsonResponse
    {
        try {
            $priorities = Priority::with(['tasks' => function ($query) {
                $query->select('id', 'priority_id', 'status');
            }])->get();

            return $this->successResponse(
                PriorityResource::collection($priorities)
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error retrieving priorities',
                $e->getMessage()
            );
        }
    }
}