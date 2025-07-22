<template>
    <div class="card">
      <div class="card-body">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Search tasks..."
                class="form-input pl-10"
                :disabled="loading"
              />
              <MagnifyingGlassIcon class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              
              <!-- Clear search button -->
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
  
          <!-- Filter Controls -->
          <div class="flex flex-wrap gap-4">
            <!-- Status Filter -->
            <div class="min-w-32">
              <select
                v-model="localFilters.status"
                @change="emitFilters"
                class="form-select"
                :disabled="loading"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
  
            <!-- Priority Filter -->
            <div class="min-w-32">
              <select
                v-model="localFilters.priority_id"
                @change="emitFilters"
                class="form-select"