<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Http\Resources\Tag\TagResource;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a listing of tags.
     */
    public function index(): JsonResponse
    {
        try {
            $tags = Tag::withCount('tasks')->get();

            return $this->successResponse(
                TagResource::collection($tags),
                'Tags retrieved successfully'
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse(
                'Error retrieving tags',
                $e->getMessage()
            );
        }
    }
}