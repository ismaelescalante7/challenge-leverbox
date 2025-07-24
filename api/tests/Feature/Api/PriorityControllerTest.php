<?php

namespace Tests\Feature\Api;

use App\Models\Priority;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Tests\TestCase;
use Tests\Traits\DatabaseTestTrait;

class PriorityControllerTest extends TestCase
{
    use RefreshDatabase, DatabaseTestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->assertTestingEnvironment();
    }

    /** @test */
    public function it_can_get_all_priorities(): void
    {
        // ✅ Usar método del trait que especifica --env=testing
        $this->seedBasicData();

        $response = $this->getJson('/api/priorities');

        $response->assertStatus(Response::HTTP_OK)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonCount(3)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name'
                ]
            ]);
    }

    /** @test */
    public function it_returns_correct_priority_format(): void
    {
        // ✅ Crear directamente para control total
        Priority::create(['name' => 'HIGH']);

        $response = $this->getJson('/api/priorities');

        $response->assertStatus(Response::HTTP_OK)
            ->assertJsonFragment([
                'name' => 'HIGH'
            ]);
    }

    /** @test */
    public function it_can_seed_priorities_safely(): void
    {
        // ✅ Test específico para verificar que el seeding funciona
        $this->assertEquals(0, Priority::count());
        
        $this->seedBasicData();
        
        $this->assertEquals(3, Priority::count());
        $this->assertDatabaseHas('priorities', ['name' => 'HIGH']);
        $this->assertDatabaseHas('priorities', ['name' => 'MEDIUM']);
        $this->assertDatabaseHas('priorities', ['name' => 'LOW']);
    }
}