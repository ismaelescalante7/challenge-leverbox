<template>
    <div class="flex flex-col">
      <ChevronUpIcon 
        :class="[
          'w-3 h-3 -mb-1',
          isActiveAsc ? 'text-blue-600' : 'text-gray-300'
        ]"
      />
      <ChevronDownIcon 
        :class="[
          'w-3 h-3',
          isActiveDesc ? 'text-blue-600' : 'text-gray-300'
        ]"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
  
  interface Props {
    field: string
    current?: string
    direction?: 'asc' | 'desc'
  }
  
  const props = withDefaults(defineProps<Props>(), {
    current: '',
    direction: 'asc'
  })
  
  const isActive = computed(() => props.current === props.field)
  const isActiveAsc = computed(() => isActive.value && props.direction === 'asc')
  const isActiveDesc = computed(() => isActive.value && props.direction === 'desc')
  </script>