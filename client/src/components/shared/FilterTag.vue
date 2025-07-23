<template>
    <span
      class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium"
      :class="variantClasses"
    >
      {{ label }}: {{ value }}
      <button 
        @click="$emit('remove')" 
        :class="removeButtonClasses"
        class="rounded hover:bg-opacity-20"
      >
        <XMarkIcon class="w-3 h-3" />
      </button>
    </span>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { XMarkIcon } from '@heroicons/vue/24/outline'
  
  interface Props {
    label: string
    value: string
    variant?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray'
  }
  
  interface Emits {
    (e: 'remove'): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    variant: 'blue'
  })
  
  defineEmits<Emits>()
  
  const variantClasses = computed(() => {
    const variants = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      red: 'bg-red-100 text-red-700',
      gray: 'bg-gray-100 text-gray-700'
    }
    return variants[props.variant]
  })
  
  const removeButtonClasses = computed(() => {
    const variants = {
      blue: 'hover:bg-blue-200',
      green: 'hover:bg-green-200',
      purple: 'hover:bg-purple-200',
      yellow: 'hover:bg-yellow-200',
      red: 'hover:bg-red-200',
      gray: 'hover:bg-gray-200'
    }
    return variants[props.variant]
  })
  </script>