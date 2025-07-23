<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-panel" @click.stop>
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                {{ isEdit ? 'Edit Task' : 'Create New Task' }}
              </h3>
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="handleSave" class="px-6 py-4 space-y-4">
            <!-- Title -->
            <div>
              <label class="form-label">
                Title *
              </label>
              <input
                ref="titleInput"
                v-model="form.title"
                type="text"
                required
                class="form-input"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.title }"
                placeholder="Enter task title..."
                :disabled="loading"
              />
              <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="form-label">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="form-textarea"
                placeholder="Enter task description..."
                :disabled="loading"
              ></textarea>
            </div>

            <!-- Status -->
            <div>
              <label class="form-label">
                Status
              </label>
              <select v-model="form.status" class="form-select" :disabled="loading">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <!-- Priority (if available) -->
            <div v-if="priorities.length > 0">
              <label class="form-label">
                Priority
              </label>
              <select v-model="form.priority_id" class="form-select" :disabled="loading">
                <option :value="null">No priority</option>
                <option
                  v-for="priority in priorities"
                  :key="priority.id"
                  :value="priority.id"
                >
                  {{ priority.label || priority.name }}
                </option>
              </select>
            </div>

            <!-- Due Date -->
            <div>
              <label class="form-label">
                Due Date
              </label>
              <input
                v-model="form.due_date"
                type="date"
                class="form-input"
                :disabled="loading"
              />
            </div>

            <!-- Tags (if available) -->
            <div v-if="tags.length > 0">
              <label class="form-label">
                Tags
              </label>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <label
                  v-for="tag in tags"
                  :key="tag.id"
                  class="inline-flex items-center mr-4 mb-2"
                >
                  <input
                    v-model="form.tag_ids"
                    :value="tag.id"
                    type="checkbox"
                    class="form-checkbox"
                    :disabled="loading"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ tag.label || tag.name }}</span>
                </label>
              </div>
            </div>
          </form>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              @click="$emit('close')"
              type="button"
              class="btn-outline"
              :disabled="loading"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              type="button"
              class="btn-primary"
              :disabled="loading || !isFormValid"
            >
              <div v-if="loading" class="loading-spinner w-4 h-4 mr-2"></div>
              {{ isEdit ? 'Update Task' : 'Create Task' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useDateUtils } from '@/composables/useDateUtils'
import { taskHelpers } from '@/services/taskService'
import type { Task, CreateTaskDto, UpdateTaskDto, Priority, Tag } from '@/types/task'

interface Props {
  task?: Task | null
  priorities: Priority[]
  tags: Tag[]
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: CreateTaskDto | UpdateTaskDto): void
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  loading: false
})

const emit = defineEmits<Emits>()

// Composables
const { formatDateForInput } = useDateUtils()

// Refs
const titleInput = ref<HTMLInputElement>()

// Form state
const form = ref({
  title: '',
  description: '',
  status: 'pending' as const,
  priority_id: null as number | null,
  due_date: '',
  tag_ids: [] as number[]
})

const errors = ref({
  title: ''
})

// Computed
const isEdit = computed(() => !!props.task)

const isFormValid = computed(() => {
  return form.value.title.trim().length > 0
})

// Methods
const resetForm = (): void => {
  if (props.task) {
    form.value = {
      title: props.task.title,
      description: props.task.description || '',
      status: taskHelpers.getStatusValue(props.task) as any,
      priority_id: props.task.priority?.id || null,
      due_date: props.task.dates?.due_date ? formatDateForInput(props.task.dates.due_date) : '',
      tag_ids: props.task.tags?.map(tag => tag.id) || []
    }
  } else {
    // Create mode - reset to defaults
    form.value = {
      title: '',
      description: '',
      status: 'pending',
      priority_id: null,
      due_date: '',
      tag_ids: []
    }
  }
  
  // Clear errors
  errors.value = { title: '' }
}

const validateForm = (): boolean => {
  errors.value = { title: '' }
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
    return false
  }
  
  if (form.value.title.trim().length < 3) {
    errors.value.title = 'Title must be at least 3 characters'
    return false
  }
  
  if (form.value.title.trim().length > 255) {
    errors.value.title = 'Title must be less than 255 characters'
    return false
  }
  
  return true
}

const handleSave = (): void => {
  if (!validateForm()) {
    // Focus on first error field
    if (errors.value.title && titleInput.value) {
      titleInput.value.focus()
    }
    return
  }
  
  const data = {
    title: form.value.title.trim(),
    description: form.value.description.trim() || undefined,
    status: form.value.status,
    priority_id: form.value.priority_id || undefined,
    due_date: form.value.due_date || undefined,
    tag_ids: form.value.tag_ids.length > 0 ? form.value.tag_ids : undefined
  }
  
  emit('save', data)
}

// Watchers
watch(() => props.task, resetForm, { immediate: true })

// Focus on title input when modal opens
watch(() => props.task, async () => {
  if (titleInput.value) {
    await nextTick()
    titleInput.value.focus()
  }
}, { immediate: true })
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

/* Custom scrollbar for tags */
.space-y-2::-webkit-scrollbar {
  width: 4px;
}

.space-y-2::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.space-y-2::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>