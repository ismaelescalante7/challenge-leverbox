<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Http\Resources\Tag\TagResource;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    /**
     * Display a listing of tags.
     */
    public function index(): JsonResponse
    {
        try {
            $tags = Tag::all();

            return response()->json(
                $tags,
                200
            );
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error retrieving tags: ' . $e->getMessage()], 500);
        }
    }
}