<?php

namespace Database\Seeders;

use App\Enums\ActiveStatusEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
	/**
	 * Seed the application's database.
	 */
	public function run(): void
	{
		$users = \App\Models\User::factory(1)->create();

		$this->call([
            PrioritySeeder::class,
            TagSeeder::class,
            TaskSeeder::class,
        ]);
	}
}
