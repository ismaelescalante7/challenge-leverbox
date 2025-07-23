<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="max-w-md w-full mx-4">
        <div class="text-center">
          <!-- Logo/Icon -->
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <DocumentTextIcon class="w-8 h-8 text-blue-600" />
          </div>
          
          <!-- Title -->
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Task Management
          </h1>
          
          <!-- Loading Message -->
          <p class="text-gray-600 mb-8">
            {{ loadingMessage }}
          </p>
          
          <!-- Loading Spinner -->
          <div class="flex justify-center mb-6">
            <div class="loading-spinner w-8 h-8 border-blue-600"></div>
          </div>
          
          <!-- Progress Steps -->
          <div class="space-y-2 text-sm text-left">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <CheckCircleIcon 
                  v-if="steps.tasks" 
                  class="w-5 h-5 text-green-500" 
                />
                <div 
                  v-else-if="currentStep === 'tasks'" 
                  class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
                ></div>
                <div 
                  v-else 
                  class="w-5 h-5 border-2 border-gray-300 rounded-full"
                ></div>
              </div>
              <span :class="steps.tasks ? 'text-green-600' : 'text-gray-500'">
                Loading tasks...
              </span>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <CheckCircleIcon 
                  v-if="steps.priorities" 
                  class="w-5 h-5 text-green-500" 
                />
                <div 
                  v-else-if="currentStep === 'priorities'" 
                  class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
                ></div>
                <div 
                  v-else 
                  class="w-5 h-5 border-2 border-gray-300 rounded-full"
                ></div>
              </div>
              <span :class="steps.priorities ? 'text-green-600' : 'text-gray-500'">
                Loading priorities...
              </span>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <CheckCircleIcon 
                  v-if="steps.tags" 
                  class="w-5 h-5 text-green-500" 
                />
                <div 
                  v-else-if="currentStep === 'tags'" 
                  class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
                ></div>
                <div 
                  v-else 
                  class="w-5 h-5 border-2 border-gray-300 rounded-full"
                ></div>
              </div>
              <span :class="steps.tags ? 'text-green-600' : 'text-gray-500'">
                Loading tags...
              </span>
            </div>
          </div>
          
          <!-- Error State -->
          <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <ExclamationTriangleIcon class="w-5 h-5 text-red-500 flex-shrink-0" />
              <p class="text-sm text-red-700">
                {{ error }}
              </p>
            </div>
            <button 
              @click="$emit('retry')"
              class="mt-3 w-full btn-primary btn-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { 
    DocumentTextIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon 
  } from '@heroicons/vue/24/outline'
  
  interface Props {
    loading: boolean
    loadingTasks: boolean
    loadingPriorities: boolean
    loadingTags: boolean
    error?: string | null
  }
  
  interface Emits {
    (e: 'retry'): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    error: null
  })
  
  defineEmits<Emits>()
  
  const steps = computed(() => ({
    tasks: !props.loadingTasks && !props.loading,
    priorities: !props.loadingPriorities,
    tags: !props.loadingTags
  }))
  
  const currentStep = computed(() => {
    if (props.loadingTasks || props.loading) return 'tasks'
    if (props.loadingPriorities) return 'priorities'
    if (props.loadingTags) return 'tags'
    return null
  })
  
  const loadingMessage = computed(() => {
    if (props.error) return 'Something went wrong'
    if (currentStep.value === 'tasks') return 'Loading your tasks...'
    if (currentStep.value === 'priorities') return 'Loading priorities...'
    if (currentStep.value === 'tags') return 'Loading tags...'
    return 'Getting everything ready...'
  })
  </script>
  
  <style scoped>
  .loading-spinner {
    @apply animate-spin rounded-full border-2 border-gray-300 border-t-current;
  }
  
  .btn-primary {
    @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
  }
  
  .btn-sm {
    @apply px-3 py-1.5 text-xs;
  }
  </style>