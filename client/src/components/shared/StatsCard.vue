<template>
    <div class="card">
      <div class="card-body">
        <div class="flex items-center">
          <div 
            class="p-3 rounded-lg"
            :class="iconClasses.background"
          >
            <component 
              :is="icon" 
              class="w-8 h-8"
              :class="iconClasses.icon"
            />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ label }}</p>
            <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
            <p v-if="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
          </div>
        </div>
        
        <!-- Trend indicator (opcional) -->
        <div v-if="trend" class="mt-4 flex items-center">
          <component 
            :is="trendIcon" 
            class="w-4 h-4 mr-1"
            :class="trendColor"
          />
          <span 
            class="text-sm font-medium"
            :class="trendColor"
          >
            {{ trend.value }}{{ trend.unit }}
          </span>
          <span class="text-xs text-gray-500 ml-2">{{ trend.label }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/solid'
  import { useStatusColors } from '@/composables/useStatusColors'
  
  interface TrendData {
    value: number
    unit: string
    label: string
    direction: 'up' | 'down'
  }
  
  interface Props {
    label: string
    value: number | string
    subtitle?: string
    icon: any
    variant?: 'primary' | 'pending' | 'in_progress' | 'progress' | 'completed' | 'overdue' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
    trend?: TrendData
  }
  
  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary'
  })
  
  // Usar el composable de colores consistentes
  const { getStatusIconClasses, statusColors } = useStatusColors()
  
  const iconClasses = computed(() => {
    // Para variantes de status, usar el sistema de colores
    if (['pending', 'in_progress', 'progress', 'completed', 'overdue', 'default'].includes(props.variant)) {
      return getStatusIconClasses(props.variant)
    }
    
    // Para otras variantes, usar colores tradicionales
    const legacyVariants = {
      primary: { background: 'bg-blue-100', icon: 'text-blue-600' },
      secondary: { background: 'bg-gray-100', icon: 'text-gray-600' },
      success: { background: 'bg-green-100', icon: 'text-green-600' },
      warning: { background: 'bg-yellow-100', icon: 'text-yellow-600' },
      danger: { background: 'bg-red-100', icon: 'text-red-600' },
      info: { background: 'bg-cyan-100', icon: 'text-cyan-600' }
    }
    
    return legacyVariants[props.variant as keyof typeof legacyVariants] || legacyVariants.primary
  })
  
  const trendIcon = computed(() => {
    return props.trend?.direction === 'up' ? ArrowUpIcon : ArrowDownIcon
  })
  
  const trendColor = computed(() => {
    if (!props.trend) return ''
    return props.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
  })
  </script>
  
  <style scoped>
  .card {
    @apply bg-white overflow-hidden shadow rounded-lg;
  }
  
  .card-body {
    @apply px-6 py-4;
  }
  </style>