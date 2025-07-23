<template>
  <span 
    :class="statusClasses"
    :style="{ backgroundColor: statusColor + '20', color: statusColor, borderColor: statusColor }"
  >
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StatusObject } from '@/types/task'

interface Props {
  status: StatusObject  // Ahora recibe el objeto completo
}

const props = defineProps<Props>()

const statusLabel = computed(() => props.status.label)

const statusColor = computed(() => props.status.color)

const statusClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border'
  
  const statusSpecificClasses: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800 border-gray-300',
    'in_progress': 'bg-blue-100 text-blue-800 border-blue-300', 
    'completed': 'bg-green-100 text-green-800 border-green-300'
  }
  
  if (!props.status.color) {
    return `${baseClasses} ${statusSpecificClasses[props.status.value] || 'bg-gray-100 text-gray-800 border-gray-300'}`
  }
  
  return baseClasses
})
</script>

<style scoped>
.inline-flex {
  white-space: nowrap;
}
</style>