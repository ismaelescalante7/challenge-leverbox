<template>
    <span :class="statusClasses">
      {{ statusLabel }}
    </span>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import type { TaskStatus } from '@/types/task'
  
  interface Props {
    status: TaskStatus
  }
  
  const props = defineProps<Props>()
  
  const statusLabel = computed(() => {
    const labels: Record<TaskStatus, string> = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    }
    return labels[props.status]
  })
  
  const statusClasses = computed(() => {
    const baseClasses = 'badge'
    const statusClasses: Record<TaskStatus, string> = {
      'pending': 'status-pending',
      'in_progress': 'status-in-progress',
      'completed': 'status-completed'
    }
    return `${baseClasses} ${statusClasses[props.status]}`
  })
  </script>