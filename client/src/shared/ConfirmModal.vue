<template>
    <div class="modal-backdrop">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-panel">
            <!-- Modal Header -->
            <div class="px-6 py-4">
              <div class="flex items-center">
                <div class="p-2 bg-red-100 rounded-lg mr-4 flex-shrink-0">
                  <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ title }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-600">
                    {{ message }}
                  </p>
                </div>
              </div>
            </div>
  
            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                @click="$emit('cancel')"
                type="button"
                class="btn-outline"
                :disabled="loading"
              >
                Cancel
              </button>
              <button
                @click="$emit('confirm')"
                type="button"
                class="btn-danger"
                :disabled="loading"
              >
                <div v-if="loading" class="loading-spinner w-4 h-4 mr-2"></div>
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
  
  interface Props {
    title: string
    message: string
    confirmText?: string
    loading?: boolean
  }
  
  interface Emits {
    (e: 'confirm'): void
    (e: 'cancel'): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    confirmText: 'Confirm',
    loading: false
  })
  
  defineEmits<Emits>()
  </script>
  
  <style scoped>
  /* Modal animations */
  .modal-backdrop {
    animation: fadeIn 0.2s ease-out;
  }
  
  .modal-panel {
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>