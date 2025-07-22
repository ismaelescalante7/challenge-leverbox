<template>
    <span class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-600/20">
      {{ label }}
      <button
        @click="$emit('remove')"
        type="button"
        class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-blue-600/20"
      >
        <span class="sr-only">Remove</span>
        <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-blue-700/50 group-hover:stroke-blue-700/75">
          <path d="m4 4 6 6m0-6-6 6" />
        </svg>
        <span class="absolute -inset-1" />
      </button>
    </span>
  </template>
  
  <script setup lang="ts">
  interface Props {
    label: string
  }
  
  interface Emits {
    (e: 'remove'): void
  }
  
  defineProps<Props>()
  defineEmits<Emits>()
  </script>