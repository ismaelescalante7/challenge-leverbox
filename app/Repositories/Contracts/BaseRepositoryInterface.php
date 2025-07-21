<?php
// app/Repositories/Contracts/BaseRepositoryInterface.php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BaseRepositoryInterface
{
    /**
     * Get all records
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Get paginated records
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Find record by id
     */
    public function find(int $id, array $columns = ['*']): ?Model;

    /**
     * Find record by id or fail
     */
    public function findOrFail(int $id, array $columns = ['*']): Model;

    /**
     * Find records by field
     */
    public function findBy(string $field, mixed $value, array $columns = ['*']): Collection;

    /**
     * Find first record by field
     */
    public function findOneBy(string $field, mixed $value, array $columns = ['*']): ?Model;

    /**
     * Create new record
     */
    public function create(array $attributes): Model;

    /**
     * Update record
     */
    public function update(Model $model, array $attributes): Model;

    /**
     * Delete record
     */
    public function delete(Model $model): bool;

    /**
     * Count records
     */
    public function count(): int;

    /**
     * Apply filters to query
     */
    public function applyFilters(array $filters): self;

    /**
     * Apply sorting to query
     */
    public function orderBy(string $column, string $direction = 'asc'): self;
}