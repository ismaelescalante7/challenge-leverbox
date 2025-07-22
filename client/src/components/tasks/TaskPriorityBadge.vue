<template>
    <span :class="priorityClasses">
      {{ priority.name }}
    </span>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import type { Priority } from '@/types/task'
  
  interface Props {
    priority: Priority
  }
  
  const props = defineProps<Props>()
  
  const priorityClasses = computed(() => {
    const baseClasses = 'badge'
    
    // Mapear nivel de prioridad a clases CSS
    const levelClasses: Record<number, string> = {
      1: 'priority-low',
      2: 'priority-medium', 
      3: 'priority-high',
      4: 'priority-urgent'
    }
    
    const levelClass = levelClasses[props.priority.level] || 'priority-low'
    return `${baseClasses} ${levelClass}`
  })
  </script>