<template>
    <div class="card mb-6">
      <div class="card-body">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                :value="searchQuery"
                @input="updateSearch"
                type="text"
                placeholder="Search tasks..."
                class="form-input pl-10"
                :disabled="loading"
              />
              <MagnifyingGlassIcon class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
  
          <!-- Status Filter -->
          <div class="min-w-0 lg:w-48">
            <select
              :value="filters.status"
              @change="updateStatusFilter"
              class="form-select w-full"
              :disabled="loading"
            >
              <option value="">All Status</option>
              <option 
                v-for="status in statusOptions" 
                :key="status.value" 
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>
  
          <!-- Priority Filter -->
          <div v-if="priorities.length > 0" class="min-w-0 lg:w-48">
            <select
              :value="filters.priority_id"
              @change="updatePriorityFilter"
              class="form-select w-full"
              :disabled="loading"
            >
              <option value="">All Priorities</option>
              <option 
                v-for="priority in priorities" 
                :key="priority.id" 
                :value="priority.id"
              >
                {{ priority.label || priority.name }}
              </option>
            </select>
          </div>
  
          <!-- Additional Filters Slot -->
          <slot name="additional-filters" />
  
          <!-- Clear Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="btn-outline flex-shrink-0"
            :disabled="loading"
          >
            <XMarkIcon class="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>
  
        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <FilterTag
            v-if="searchQuery"
            label="Search"
            :value="searchQuery"
            variant="blue"
            @remove="clearSearch"
          />
  
          <FilterTag
            v-if="filters.status"
            label="Status"
            :value="getStatusLabel(filters.status)"
            variant="green"
            @remove="clearStatusFilter"
          />
  
          <FilterTag
            v-if="filters.priority_id"
            label="Priority"
            :value="getPriorityName(filters.priority_id)"
            variant="purple"
            @remove="clearPriorityFilter"
          />
  
          <!-- Additional Active Filters Slot -->
          <slot name="active-filters" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
  import FilterTag from '@/components/shared/FilterTag.vue'
  import type { Priority } from '@/types/task'
  
  interface TaskFilters {
    status: string
    priority_id: string | number
    [key: string]: any
  }
  
  interface StatusOption {
    value: string
    label: string
  }
  
  interface Props {
    searchQuery: string
    filters: TaskFilters
    priorities: Priority[]
    loading?: boolean
    statusOptions?: StatusOption[]
  }
  
  interface Emits {
    (e: 'update:searchQuery', value: string): void
    (e: 'update:filters', filters: TaskFilters): void
    (e: 'search'): void
    (e: 'clearAllFilters'): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    statusOptions: () => [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' }
    ]
  })
  
  const emit = defineEmits<Emits>()
  
  // Computed
  const hasActiveFilters = computed(() => 
    props.searchQuery || props.filters.status || props.filters.priority_id
  )
  
  // Methods
  const updateSearch = (event: Event): void => {
    const target = event.target as HTMLInputElement
    if (target.value.length > 3) {
        emit('update:searchQuery', target.value)
        // Emitir search después de un pequeño delay para mejor UX
        setTimeout(() => emit('search'), 100)
    }
   
  }
  
  const updateStatusFilter = (event: Event): void => {
    const target = event.target as HTMLSelectElement
    const newFilters = { ...props.filters, status: target.value }
    emit('update:filters', newFilters)
    // Aplicar filtros inmediatamente
    emit('search')
  }
  
  const updatePriorityFilter = (event: Event): void => {
    const target = event.target as HTMLSelectElement
    const newFilters = { ...props.filters, priority_id: target.value }
    emit('update:filters', newFilters)
    // Aplicar filtros inmediatamente
    emit('search')
  }
  
  const clearSearch = (): void => {
    emit('update:searchQuery', '')
    emit('search')
  }
  
  const clearStatusFilter = (): void => {
    const newFilters = { ...props.filters, status: '' }
    emit('update:filters', newFilters)
    emit('search')
  }
  
  const clearPriorityFilter = (): void => {
    const newFilters = { ...props.filters, priority_id: '' }
    emit('update:filters', newFilters)
    emit('search')
  }
  
  const clearAllFilters = (): void => {
    emit('clearAllFilters')
  }
  
  const getStatusLabel = (status: string): string => {
    const option = props.statusOptions.find(opt => opt.value === status)
    return option?.label || status
  }
  
  const getPriorityName = (priorityId: string | number): string => {
    const priority = props.priorities.find(p => p.id === Number(priorityId))
    return priority?.label || priority?.name || 'Unknown'
  }
  </script>
  
  <style scoped>
  .card {
    @apply bg-white overflow-hidden shadow rounded-lg;
  }
  
  .card-body {
    @apply px-6 py-4;
  }
  
  .form-input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500;
  }
  
  .form-select {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 bg-white;
  }
  
  .btn-outline {
    @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
  }
  
  /* Ensure proper spacing and alignment */
  .flex-shrink-0 {
    flex-shrink: 0;
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 1024px) {
    .lg\:flex-row {
      gap: 1rem;
    }
    
    .lg\:w-48 {
      width: 100%;
      min-width: 200px;
    }
  }
  
  /* Fix for select appearance */
  .form-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }
  </style>