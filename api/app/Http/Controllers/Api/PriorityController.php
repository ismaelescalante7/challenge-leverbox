<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Priority;
use App\Http\Resources\Priority\PriorityResource;
use Illuminate\Http\JsonResponse;

class PriorityController extends Controller
{

    /**
     * Display a listing of priorities.
     */
    public function index(): JsonResponse
    {
        try {
            $priorities = Priority::all();

            return response()->json(
                $priorities,
                200
            );

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error retrieving priorities: ' . $e->getMessage()], 500);
        }
    }
}
