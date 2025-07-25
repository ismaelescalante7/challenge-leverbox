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
		$user = \App\Models\User::create([
			'name' => 'user-leverbox',
			'email' => 'test@leverbox.com',
			'password' => 'password'
		]);

		$this->call([
            PrioritySeeder::class,
            TagSeeder::class,
            TaskSeeder::class,
        ]);
	}
}
