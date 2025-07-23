<template>
  <span 
    :class="statusClasses"
    :style="customStyle"
  >
    <component :is="statusIcon" class="w-3 h-3 mr-1" />
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClockIcon, PlayIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'
import { useStatusColors } from '@/composables/useStatusColors'
import { taskHelpers } from '@/services/taskService'
import type { StatusObject } from '@/types/task'

interface Props {
  status: StatusObject | string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

// Composable para colores consistentes
const { getStatusBadgeClasses, getCustomColor } = useStatusColors()

// Extraer valores del status
const statusValue = computed(() => {
  return typeof props.status === 'string' ? props.status : props.status.value
})

const statusLabel = computed(() => {
  if (typeof props.status === 'string') {
    return props.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  return props.status.label || statusValue.value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
})

// Icono del status
const statusIcon = computed(() => {
  switch (statusValue.value) {
    case 'pending': return ClockIcon
    case 'in_progress': return PlayIcon
    case 'completed': return CheckCircleIcon
    default: return ClockIcon
  }
})

// Clases CSS usando el sistema de colores consistente
const statusClasses = computed(() => {
  const baseClasses = {
    'sm': 'px-2 py-0.5 text-xs',
    'md': 'px-2.5 py-0.5 text-xs',
    'lg': 'px-3 py-1 text-sm'
  }[props.size]

  // Si no hay color personalizado, usar las clases del sistema
  if (typeof props.status === 'string' || !props.status.color) {
    return `${baseClasses} ${getStatusBadgeClasses(statusValue.value)}`
  }

  // Si hay color personalizado, usar clases base
  return `${baseClasses} inline-flex items-center rounded-full font-medium border`
})

// Estilo personalizado si el status tiene color custom
const customStyle = computed(() => {
  if (typeof props.status === 'object' && props.status.color) {
    return {
      backgroundColor: props.status.color + '20',
      color: props.status.color,
      borderColor: props.status.color + '50'
    }
  }
  return undefined
})
</script>

<style scoped>
.inline-flex {
  white-space: nowrap;
}
</style>