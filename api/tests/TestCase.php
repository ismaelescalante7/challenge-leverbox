<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // ✅ Asegurar que estamos en entorno testing
        $this->app['env'] = 'testing';
        
        // Configuración básica sin Vite
        $this->withoutVite();
    }

    /**
     * Seed database with specific seeder in testing environment.
     */
    protected function seedWithClass(string $seederClass): void
    {
        $this->artisan('db:seed', [
            '--class' => $seederClass,
            '--env' => 'testing'
        ]);
    }

    /**
     * Fresh migrate for testing.
     */
    protected function freshMigrate(): void
    {
        $this->artisan('migrate:fresh', [
            '--env' => 'testing'
        ]);
    }

    /**
     * Assert we're in testing environment.
     */
    protected function assertTestingEnvironment(): void
    {
        $this->assertEquals('testing', $this->app->environment());
    }
}