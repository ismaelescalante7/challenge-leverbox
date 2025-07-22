
<?php
// routes/api.php (Laravel 12)

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\PriorityController;
use App\Http\Controllers\Api\TagController;

/*
|--------------------------------------------------------------------------
| API Routes - Laravel 12
|--------------------------------------------------------------------------
*/

// Health check endpoint
Route::get('health', fn() => response()->json([
    'success' => true,
    'message' => 'API is running',
    'timestamp' => now()->toISOString(),
    'version' => '1.0.0',
    'laravel' => '12.x'
]));

// User endpoint with sanctum
Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());

/*
|--------------------------------------------------------------------------
| Task Management Routes
|--------------------------------------------------------------------------
*/
Route::prefix('tasks')->name('tasks.')->group(function () {
    // Special endpoints (before resource routes)
    //Route::get('statistics', [TaskController::class, 'stats'])->name('stats');
    Route::get('search', [TaskController::class, 'search'])->name('search');
    //Route::get('overdue', [TaskController::class, 'overdue'])->name('overdue');
    //Route::get('by-status/{status}', [TaskController::class, 'byStatus'])->name('by-status');
    
    // Bulk operations
    Route::patch('bulk-update', [TaskController::class, 'bulkUpdate'])->name('bulk-update');
    Route::delete('bulk-delete', [TaskController::class, 'bulkDelete'])->name('bulk-delete');
    
    // Individual task status update
    Route::patch('{task}/status', [TaskController::class, 'updateStatus'])->name('update-status');
    
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

/*
|--------------------------------------------------------------------------
| System Information Routes
|--------------------------------------------------------------------------
*/
Route::prefix('system')->group(function () {
    Route::get('info', fn() => response()->json([
        'success' => true,
        'data' => [
            'app_name' => config('app.name'),
            'app_version' => '1.0.0',
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'timezone' => config('app.timezone'),
            'environment' => app()->environment(),
        ]
    ]));
    
    Route::get('routes', fn() => response()->json([
        'success' => true,
        'data' => [
            'tasks' => route('tasks.index'),
            'priorities' => route('priorities.index'),
            'tags' => route('tags.index'),
        ]
    ]));
});