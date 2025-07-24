<?php

namespace Tests\Feature\Api;

use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Tests\TestCase;
use Tests\Traits\DatabaseTestTrait;

class TagControllerTest extends TestCase
{
    use RefreshDatabase, DatabaseTestTrait;

    protected function setUp(): void
    {
        parent::setUp();
        
        // ✅ Verificar que estamos en entorno testing
        $this->assertTestingEnvironment();
    }

    /** @test */
    public function it_can_get_all_tags(): void
    {
        // Crear tags usando tu estructura
        Tag::create(['name' => 'DEV']);
        Tag::create(['name' => 'QA']);
        Tag::create(['name' => 'HR']);

        $response = $this->getJson('/api/tags');

        $response->assertStatus(Response::HTTP_OK)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonCount(3)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'created_at',
                    'updated_at'
                ]
            ]);
    }

    /** @test */
    public function it_returns_correct_tag_format(): void
    {
        $tag = Tag::create(['name' => 'DEV']);

        $response = $this->getJson('/api/tags');

        $response->assertStatus(Response::HTTP_OK)
            ->assertJsonFragment([
                'id' => $tag->id,
                'name' => 'DEV'
            ]);

        // Verificar que tiene timestamps
        $responseData = $response->json();
        $this->assertArrayHasKey('created_at', $responseData[0]);
        $this->assertArrayHasKey('updated_at', $responseData[0]);
    }

    /** @test */
    public function it_returns_empty_array_when_no_tags(): void
    {
        $response = $this->getJson('/api/tags');

        $response->assertStatus(Response::HTTP_OK)
            ->assertJson([])
            ->assertJsonCount(0);
    }

    /** @test */
    public function it_orders_tags_consistently(): void
    {
        // Crear en orden aleatorio
        Tag::create(['name' => 'HR']);
        Tag::create(['name' => 'DEV']);
        Tag::create(['name' => 'QA']);

        $response = $this->getJson('/api/tags');

        $response->assertStatus(Response::HTTP_OK);
        
        $tags = $response->json();
        
        // Verificar que hay 3 tags
        $this->assertCount(3, $tags);
        
        // Verificar que todas tienen la estructura correcta
        foreach ($tags as $tag) {
            $this->assertArrayHasKey('id', $tag);
            $this->assertArrayHasKey('name', $tag);
            $this->assertArrayHasKey('created_at', $tag);
            $this->assertArrayHasKey('updated_at', $tag);
            $this->assertIsInt($tag['id']);
            $this->assertIsString($tag['name']);
        }
    }
    
    /** @test */
    public function it_returns_tags_with_valid_names(): void
    {
        Tag::create(['name' => 'DEV']);
        Tag::create(['name' => 'QA']);
        Tag::create(['name' => 'HR']);

        $response = $this->getJson('/api/tags');

        $response->assertStatus(Response::HTTP_OK);
        
        $tags = $response->json();
        
        // Verificar que los nombres están correctos
        $names = collect($tags)->pluck('name')->toArray();
        
        $this->assertContains('DEV', $names);
        $this->assertContains('QA', $names);
        $this->assertContains('HR', $names);
        
        // Verificar que no hay nombres vacíos
        foreach ($names as $name) {
            $this->assertNotEmpty($name);
            $this->assertIsString($name);
        }
    }

    /** @test */
    public function it_can_seed_tags_safely(): void
    {
        // ✅ Test específico para verificar que el seeding funciona
        $this->assertEquals(0, Tag::count());
        
        $this->seedWithClass('TagSeeder');
        
        $this->assertEquals(3, Tag::count());
        $this->assertDatabaseHas('tags', ['name' => 'DEV']);
        $this->assertDatabaseHas('tags', ['name' => 'QA']);
        $this->assertDatabaseHas('tags', ['name' => 'HR']);
    }

    /** @test */
    public function it_maintains_testing_environment(): void
    {
        // ✅ Verificar que seguimos en testing
        $this->assertEquals('testing', app()->environment());
    }


    /** @test */
    public function it_returns_valid_json_response(): void
    {
        Tag::create(['name' => 'DEV']);

        $response = $this->getJson('/api/tags');

        $response->assertStatus(Response::HTTP_OK);
        
        // Verificar que es JSON válido
        $content = $response->getContent();
        $decodedContent = json_decode($content, true);
        
        $this->assertIsArray($decodedContent);
        $this->assertJson($content);
    }
}