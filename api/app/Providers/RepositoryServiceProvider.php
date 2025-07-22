<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Foundation\Application;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\TaskRepository;
use App\Services\TaskService;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * All of the container bindings that should be registered.
     */
    public array $bindings = [
        TaskRepositoryInterface::class => TaskRepository::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        // Register repositories (handled by $bindings property)
        
        // Register services as singletons
        $this->app->singleton(TaskService::class, function (Application $app): TaskService {
            return new TaskService(
                $app->make(TaskRepositoryInterface::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Boot logic if needed
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return [
            TaskRepositoryInterface::class,
            TaskService::class,
        ];
    }
}