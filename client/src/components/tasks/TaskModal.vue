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
                @click="handleClose"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- 🎯 ERROR ALERT - Solo para errores de validación del servidor -->
          <div v-if="globalError" class="px-6 py-4 bg-red-50 border-b border-red-200">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ globalError.type === 'validation' ? 'Validation Error' : 'Error' }}
                </h3>
                <div class="mt-1 text-sm text-red-700">
                  {{ globalError.message }}
                </div>
                <!-- Lista de errores de validación generales (no mapeados a campos específicos) -->
                <div v-if="globalError.type === 'validation' && hasUnmappedErrors" class="mt-2">
                  <ul class="list-disc list-inside text-sm text-red-600">
                    <li v-for="(errorList, field) in unmappedErrors" :key="field">
                      <strong>{{ formatFieldName(field) }}:</strong> {{ errorList.join(', ') }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="ml-auto pl-3">
                <button
                  @click="$emit('clear-error')"
                  class="text-red-400 hover:text-red-600"
                >
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
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
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': hasError('title') }"
                placeholder="Enter task title..."
                :disabled="loading"
                @input="clearFieldError('title')"
              />
              <p v-if="getError('title')" class="form-error">{{ getError('title') }}</p>
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
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': hasError('description') }"
                placeholder="Enter task description..."
                :disabled="loading"
                @input="clearFieldError('description')"
              ></textarea>
              <p v-if="getError('description')" class="form-error">{{ getError('description') }}</p>
            </div>

            <!-- Status -->
            <div>
              <label class="form-label">
                Status
              </label>
              <select 
                v-model="form.status" 
                class="form-select" 
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': hasError('status') }"
                :disabled="loading"
                @change="clearFieldError('status')"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <p v-if="getError('status')" class="form-error">{{ getError('status') }}</p>
            </div>

            <!-- Priority (if available) -->
            <div v-if="priorities.length > 0">
              <label class="form-label">
                Priority
              </label>
              <select 
                v-model="form.priority_id" 
                class="form-select" 
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': hasError('priority_id') }"
                :disabled="loading"
                @change="clearFieldError('priority_id')"
              >
                <option :value="null">No priority</option>
                <option
                  v-for="priority in priorities"
                  :key="priority.id"
                  :value="priority.id"
                >
                  {{ priority.label || priority.name }}
                </option>
              </select>
              <p v-if="getError('priority_id')" class="form-error">{{ getError('priority_id') }}</p>
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
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': hasError('due_date') }"
                :disabled="loading"
                @change="clearFieldError('due_date')"
              />
              <p v-if="getError('due_date')" class="form-error">{{ getError('due_date') }}</p>
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
                    @change="clearFieldError('tag_ids')"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ tag.label || tag.name }}</span>
                </label>
              </div>
              <p v-if="getError('tag_ids')" class="form-error">{{ getError('tag_ids') }}</p>
            </div>
          </form>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              @click="handleClose"
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
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useDateUtils } from '@/composables/useDateUtils'
import { taskHelpers } from '@/services/taskService'
import type { Task, CreateTaskDto, UpdateTaskDto, Priority, Tag } from '@/types/task'

// 🎯 INTERFACE PARA EL ERROR DEL STORE
interface StoreError {
  message: string
  type: 'validation' | 'network' | 'server' | 'unknown'
  validationErrors?: Record<string, string[]>
  statusCode?: number
}

interface Props {
  task?: Task | null
  priorities: Priority[]
  tags: Tag[]
  loading?: boolean
  error?: StoreError | null 
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: CreateTaskDto | UpdateTaskDto): void
  (e: 'clear-error'): void 
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  loading: false,
  error: null
})

const emit = defineEmits<Emits>()

// 🔍 DEBUG: Log props changes
watch(() => props.error, (newError) => {
}, { immediate: true })

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

// Local form errors (solo para validación del frontend)
const localErrors = ref<Record<string, string>>({})

// Computed
const isEdit = computed(() => !!props.task)

const isFormValid = computed(() => {
  return form.value.title.trim().length > 0 && !hasAnyErrors.value
})

const globalError = computed(() => {
  return props.error
})


const validationErrors = computed(() => {
  const errors = globalError.value?.validationErrors || {}
  return errors
})


// Errores que no están mapeados a campos específicos
const unmappedErrors = computed(() => {
  const mapped = ['title', 'description', 'status', 'priority_id', 'due_date', 'tag_ids']
  const unmapped: Record<string, string[]> = {}
  
  Object.keys(validationErrors.value).forEach(field => {
    if (!mapped.includes(field)) {
      unmapped[field] = validationErrors.value[field]
    }
  })
  
  return unmapped
})

const hasUnmappedErrors = computed(() => {
  return Object.keys(unmappedErrors.value).length > 0
})

const hasAnyErrors = computed(() => {
  return Object.keys(localErrors.value).length > 0 || 
         Object.keys(validationErrors.value).length > 0
})

// 🎯 ERROR HELPER METHODS
const getError = (field: string): string | null => {
  // Priorizar errores locales sobre errores del servidor
  if (localErrors.value[field]) {
    return localErrors.value[field]
  }
  
  // Luego errores de validación del servidor
  const serverErrors = validationErrors.value[field]
  if (serverErrors && serverErrors.length > 0) {
    return serverErrors[0]
  }
  
  return null
}

const hasError = (field: string): boolean => {
  const hasErr = !!getError(field)
  return hasErr
}

const clearFieldError = (field: string): void => {
  delete localErrors.value[field]
  
  // Si hay errores de validación del servidor, limpiar todo
  if (globalError.value?.type === 'validation') {
    emit('clear-error')
  }
}

const clearAllErrors = (): void => {
  localErrors.value = {}
}

// Field name formatter for unmapped errors
const formatFieldName = (field: string): string => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Methods
const resetForm = (): void => {
  
  if (props.task) {
    form.value = {
      title: props.task.title,
      description: props.task.description || '',
      status: taskHelpers.getStatusValue(props.task) as any,
      priority_id: props.task.priority?.id || null,
      due_date: props.task.dates.due_date ? formatDateForInput(props.task.dates.due_date) : '',
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
  
  // Clear local errors
  clearAllErrors()
}

const validateForm = (): boolean => {

  clearAllErrors()
  let isValid = true
  
  // Title validation
  if (!form.value.title.trim()) {
    localErrors.value.title = 'Title is required'
    isValid = false
  } else if (form.value.title.trim().length < 3) {
    localErrors.value.title = 'Title must be at least 3 characters'
    isValid = false
  } else if (form.value.title.trim().length > 255) {
    localErrors.value.title = 'Title must be less than 255 characters'
    isValid = false
  }
  
  // Description validation (opcional)
  if (form.value.description && form.value.description.trim().length > 1000) {
    localErrors.value.description = 'Description must be less than 1000 characters'
    isValid = false
  }
  

  return isValid
}

const handleSave = (): void => {
  
  if (!validateForm()) {
    // Focus on first error field
    const firstErrorField = Object.keys(localErrors.value)[0]
    if (firstErrorField === 'title' && titleInput.value) {
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

const handleClose = (): void => {
  clearAllErrors()
  emit('clear-error')
  emit('close')
}

// Watchers
watch(() => props.task, resetForm, { immediate: true })

// Limpiar errores locales cuando cambian los errores del store
watch(() => props.error, (newError) => {
  if (!newError) {
    clearAllErrors()
  }
})

// Focus on title input when modal opens
watch(() => props.task, async () => {
  await nextTick()
  if (titleInput.value) {
    titleInput.value.focus()
  }
}, { immediate: true })
</script>

<style scoped>
/* Modal animations */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  width: 100%;
  max-width: 32rem;
  margin: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-panel {
  animation: slideUp 0.3s ease-out;
}

/* Form styles */
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
}

/* Button styles */
.btn-outline {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s ease-in-out;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading spinner */
.loading-spinner {
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
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

@keyframes spin {
  to {
    transform: rotate(360deg);
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
