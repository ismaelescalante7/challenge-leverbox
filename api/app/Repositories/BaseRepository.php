<?php
// app/Repositories/BaseRepository.php

namespace App\Repositories;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements BaseRepositoryInterface
{
    protected Model $model;
    protected Builder $query;

    public function __construct(Model $model)
    {
        $this->model = $model;
        $this->resetQuery();
    }

    /**
     * Get all records
     */
    public function all(array $columns = ['*']): Collection
    {
        return $this->query->get($columns);
    }

    /**
     * Get paginated records
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        $result = $this->query->paginate($perPage, $columns);
        $this->resetQuery();
        return $result;
    }

    /**
     * Find record by id
     */
    public function find(int $id, array $columns = ['*']): ?Model
    {
        return $this->model->find($id, $columns);
    }

    /**
     * Find record by id or fail
     */
    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        return $this->model->findOrFail($id, $columns);
    }

    /**
     * Find records by field
     */
    public function findBy(string $field, mixed $value, array $columns = ['*']): Collection
    {
        return $this->model->where($field, $value)->get($columns);
    }

    /**
     * Find first record by field
     */
    public function findOneBy(string $field, mixed $value, array $columns = ['*']): ?Model
    {
        return $this->model->where($field, $value)->first($columns);
    }

    /**
     * Create new record
     */
    public function create(array $attributes): Model
    {
        return $this->model->create($attributes);
    }

    /**
     * Update record
     */
    public function update(Model $model, array $attributes): Model
    {
        $model->update($attributes);
        return $model->fresh();
    }

    /**
     * Delete record
     */
    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    /**
     * Count records
     */
    public function count(): int
    {
        $count = $this->query->count();
        $this->resetQuery();
        return $count;
    }

    /**
     * Apply filters to query
     */
    public function applyFilters(array $filters): self
    {
        foreach ($filters as $field => $value) {
            if (!is_null($value) && $value !== '') {
                $this->applyFilter($field, $value);
            }
        }

        return $this;
    }

    /**
     * Apply sorting to query
     */
    public function orderBy(string $column, string $direction = 'asc'): self
    {
        $this->query->orderBy($column, $direction);
        return $this;
    }

    /**
     * Reset query builder
     */
    protected function resetQuery(): void
    {
        $this->query = $this->model->newQuery();
    }

    /**
     * Apply individual filter - can be overridden in child classes
     */
    protected function applyFilter(string $field, mixed $value): void
    {
        $this->query->where($field, $value);
    }

    /**
     * Get the query builder
     */
    protected function getQuery(): Builder
    {
        return $this->query;
    }
}