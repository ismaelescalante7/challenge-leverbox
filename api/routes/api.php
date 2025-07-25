<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PriorityController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes (Public)
|--------------------------------------------------------------------------
*/
Route::post('login', [AuthController::class, 'login'])->name('auth.login');
Route::post('register', [AuthController::class, 'register'])->name('auth.register');

/*
|--------------------------------------------------------------------------
| Protected Routes (Require Authentication)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication routes (protected)
    Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('user', [AuthController::class, 'user'])->name('auth.user');
    
    /*
    |--------------------------------------------------------------------------
    | Task Management Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('tasks')->name('tasks.')->group(function () {
        Route::get('search', [TaskController::class, 'search'])->name('search');
        Route::patch('{task}/status', [TaskController::class, 'updateStatus'])->name('update-status');
        
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
             'index' => 'priorities.index',
             'store' => 'priorities.store',
             'show' => 'priorities.show',
             'update' => 'priorities.update',
             'destroy' => 'priorities.destroy'
         ]);

    /*
    |--------------------------------------------------------------------------
    | Tag Management Routes
    |--------------------------------------------------------------------------
    */
    Route::apiResource('tags', TagController::class)
         ->names([
             'index' => 'tags.index',
             'store' => 'tags.store',
             'show' => 'tags.show',
             'update' => 'tags.update',
             'destroy' => 'tags.destroy'
         ]);
});

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
// Health check endpoint (público)
Route::get('health', fn() => response()->json([
    'success' => true,
    'message' => 'API is running',
    'timestamp' => now()->toISOString(),
    'version' => '1.0.0',
    'laravel' => '10.x'
]));

/*
|--------------------------------------------------------------------------
| CSRF Cookie Route (for SPA authentication)
|--------------------------------------------------------------------------
*/
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});