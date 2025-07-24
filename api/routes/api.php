<?php

use App\Http\Controllers\Api\PriorityController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
});

Route::prefix('tasks')->name('tasks.')->group(function () {
    Route::get('search', [TaskController::class, 'search'])->name('search');
    // Individual task status update
    Route::patch('{task}/status', [TaskController::class, 'updateStatus'])->name('update-status');
    
    Route::patch('bulk-update', [TaskController::class, 'bulkUpdate'])->name('bulk-update');
    Route::delete('bulk-delete', [TaskController::class, 'bulkDelete'])->name('bulk-delete');
    
    // Standard CRUD operations
    Route::apiResource('/', TaskController::class)
         ->parameters(['' => 'task'])
         ->names([
             'index' => 'index',
             'store' => 'store',
             'show' => 'show',
             'update' => 'update',
             'destroy' => 'destroy'
         ]);
});

/*
|--------------------------------------------------------------------------
| Priority Management Routes
|--------------------------------------------------------------------------
*/
Route::apiResource('priorities', PriorityController::class)
     ->names([
         'index' => 'priorities.index'
     ]);

/*
|--------------------------------------------------------------------------
| Tag Management Routes
|--------------------------------------------------------------------------
*/
Route::apiResource('tags', TagController::class)
     ->names([
         'index' => 'tags.index'
     ]);


// Health check endpoint
Route::get('health', fn() => response()->json([
    'success' => true,
    'message' => 'API is running',
    'timestamp' => now()->toISOString(),
    'version' => '1.0.0',
    'laravel' => '12.x'
]));
