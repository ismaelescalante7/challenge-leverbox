<?php
// app/Traits/ApiResponseTrait.php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponseTrait
{
    /**
     * Success response
     */
    protected function successResponse(
        mixed $data = null,
        int $statusCode = 200
    ): JsonResponse {

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Error response
     */
    protected function errorResponse(
        int $statusCode = 400,
        mixed $errors = null
    ): JsonResponse {

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        if (config('app.debug') && isset($this->debugInfo)) {
            $response['debug'] = $this->debugInfo;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Resource response
     */
    protected function resourceResponse(
        JsonResource $resource,
        int $statusCode = 200
    ): JsonResponse {
        return $this->successResponse($resource, $statusCode);
    }

    /**
     * Collection response
     */
    protected function collectionResponse(
        ResourceCollection $collection,
    ): ResourceCollection {
        return $collection;
    }

    /**
     * Created response
     */
    protected function createdResponse(
        mixed $data = null,
    ): JsonResponse {
        return $this->successResponse($data, 201);
    }

    /**
     * Updated response
     */
    protected function updatedResponse(
        mixed $data = null,
    ): JsonResponse {
        return $this->successResponse($data, 200);
    }

    /**
     * Deleted response
     */
    protected function deletedResponse(
    ): JsonResponse {
        return $this->successResponse(null, 200);
    }

    /**
     * Not found response
     */
    protected function notFoundResponse(
    ): JsonResponse {
        return $this->errorResponse(404);
    }

    /**
     * Validation error response
     */
    protected function validationErrorResponse(
        mixed $errors,
    ): JsonResponse {
        return $this->errorResponse(422, $errors);
    }

    /**
     * Server error response
     */
    protected function serverErrorResponse(
        mixed $error = null
    ): JsonResponse {
        $this->debugInfo = $error;
        return $this->errorResponse(500, config('app.debug') ? $error : null);
    }
}