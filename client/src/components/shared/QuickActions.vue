<template>
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
      </div>
      <div class="card-body">
        <div class="flex flex-wrap gap-4">
          <div v-if="primaryActions.length > 0" class="flex flex-wrap gap-3">
            <component
              v-for="action in primaryActions"
              :key="action.key"
              :is="action.component || 'button'"
              :to="action.to"
              @click="action.onClick"
              :disabled="action.disabled"
              class="btn-primary"
              :class="action.class"
            >
              <component :is="action.icon" class="w-5 h-5 mr-2" />
              {{ action.label }}
            </component>
          </div>
        </div>
  
        <!-- Additional Info -->
        <div v-if="$slots.default" class="mt-4 pt-4 border-t border-gray-200">
          <slot />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  interface QuickAction {
    key: string
    label: string
    icon: any
    component?: 'button' | 'router-link'
    to?: string
    onClick?: () => void
    disabled?: boolean
    class?: string
  }
  
  interface Props {
    title?: string
    primaryActions?: QuickAction[]
    secondaryActions?: QuickAction[]
  }
  
  withDefaults(defineProps<Props>(), {
    title: 'Quick Actions',
    primaryActions: () => [],
    secondaryActions: () => []
  })
  </script>
  
  <style scoped>
  .card {
    @apply bg-white overflow-hidden shadow rounded-lg;
  }
  
  .card-header {
    @apply px-6 py-4 border-b border-gray-200;
  }
  
  .card-body {
    @apply px-6 py-4;
  }
  
  .btn-primary {
    @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-outline {
    @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  </style>