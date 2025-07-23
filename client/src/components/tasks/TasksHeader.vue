
<template>
    <div>
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
            <p class="mt-2 text-gray-600">
              {{ subtitle }} - {{ totalTasks }} total
            </p>
          </div>
          
          <div class="mt-4 lg:mt-0 flex space-x-3">
            <button
              @click="$emit('create')"
              class="btn-primary"
            >
              <PlusIcon class="w-5 h-5 mr-2" />
              New Task
            </button>
            
            <button
              @click="$emit('refresh')"
              :disabled="loading"
              class="btn-outline"
            >
              <ArrowPathIcon 
                class="w-5 h-5 mr-2" 
                :class="{ 'animate-spin': loading }"
              />
              Refresh
            </button>
          </div>
        </div>
      </div>
  
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Tasks"
          :value="totalTasks"
          :icon="DocumentTextIcon"
          variant="primary"
        />
  
        <StatsCard
          label="Pending"
          :value="pendingTasks"
          :icon="ClockIcon"
          variant="pending"
        />
  
        <StatsCard
          label="In Progress"
          :value="inProgressTasks"
          :icon="PlayIcon"
          variant="in_progress"
        />
  
        <StatsCard
          label="Completed"
          :value="completedTasks"
          :icon="CheckCircleIcon"
          variant="completed"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import {
    PlusIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ClockIcon,
    PlayIcon,
    CheckCircleIcon
  } from '@heroicons/vue/24/outline'
  import StatsCard from '@/components/shared/StatsCard.vue'
  
  interface Props {
    title?: string
    subtitle?: string
    totalTasks: number
    pendingTasks: number
    inProgressTasks: number
    completedTasks: number
    loading?: boolean
  }
  
  interface Emits {
    (e: 'create'): void
    (e: 'refresh'): void
  }
  
  withDefaults(defineProps<Props>(), {
    title: 'Tasks',
    subtitle: 'Manage your tasks',
    loading: false
  })
  
  defineEmits<Emits>()
  </script>
  
  <style scoped>
  .btn-primary {
    @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
  }
  
  .btn-outline {
    @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  </style>