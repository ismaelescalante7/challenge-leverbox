<?php

namespace Tests\Traits;

use Illuminate\Foundation\Testing\RefreshDatabase;

trait DatabaseTestTrait
{
    use RefreshDatabase;

    /**
     * Seed basic data for testing.
     */
    protected function seedBasicData(): void
    {
        $this->artisan('db:seed', ['--class' => 'PrioritySeeder']);
    }
}