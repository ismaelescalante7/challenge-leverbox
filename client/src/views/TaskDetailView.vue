<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading task...</p>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="p-4 bg-red-50 rounded-lg max-w-md mx-auto">
          <h3 class="text-red-800 font-medium">Error loading task</h3>
          <p class="text-red-600 text-sm mt-1">{{ error }}</p>
          <button @click="loadTask" class="btn-primary btn-sm mt-3">
            Try Again
          </button>
        </div>
      </div>
  
      <!-- Task Detail -->
      <div v-else-if="currentTask" class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button @click="goBack" class="btn-outline">
              <ArrowLeftIcon class="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Task Details</h1>
          </div>
          
          <div class="flex space-x-2">
            <button @click="editTask" class="btn-primary">
              <PencilIcon class="w-5 h-5 mr-2" />
              Edit
            </button>
            <button @click="confirmDelete" class="btn-danger">
              <TrashIcon class="w-5 h-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
  
        <!-- Task Info Card -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-medium text-gray-900">{{ currentTask.title }}</h2>
              <TaskStatusBadge :status="currentTask.status" />
            </div>
          </div>
          
          <div class="card-body space-y-4">
            <!-- Description -->
            <div v-if="currentTask.description">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p class="text-gray-900 whitespace-pre-wrap">{{ currentTask.description }}</p>
            </div>
  
            <!-- Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Priority -->
              <div v-if="currentTask.priority">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                <TaskPriorityBadge :priority="currentTask.priority" />
              </div>
  
              <!-- Due Date -->
              <div v-if="currentTask.due_date">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                <div class="flex items-center space-x-2">
                  <CalendarIcon class="w-5 h-5 text-gray-400" />
                  <span class="text-gray-900">{{ formatDate(currentTask.due_date) }}</span>
                  <span v-if="currentTask.is_overdue" class="badge-danger">Overdue</span>
                </div>
              </div>
  
              <!-- Created -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Created</h3>
                <div class="flex items-center space-x-2">
                  <ClockIcon class="w-5 h-5 text-gray-400" />
                  <span class="text-gray-900">{{ formatDateTime(currentTask.created_at) }}</span>
                </div>
              </div>
  
              <!-- Last Updated -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
                <div class="flex items-center space-x-2">
                  <ArrowPathIcon class="w-5 h-5 text-gray-400" />
                  <span class="text-gray-900">{{ formatDateTime(currentTask.updated_at) }}</span>
                </div>
              </div>
  
              <!-- Completed At -->
              <div v-if="currentTask.completed_at" class="md:col-span-2">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Completed</h3>
                <div class="flex items-center space-x-2">
                  <CheckCircleIcon class="w-5 h-5 text-green-500" />
                  <span class="text-gray-900">{{ formatDateTime(currentTask.completed_at) }}</span>
                </div>
              </div>
            </div>
  
            <!-- Tags -->
            <div v-if="currentTask.tags && currentTask.tags.length > 0">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in currentTask.tags"
                  :key="tag.id"
                  class="badge-gray"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div class="card-body">
            <div class="flex flex-wrap gap-3">
              <button
                v-if="currentTask.status === 'pending'"
                @click="updateStatus('in_progress')"
                class="btn-primary btn-sm"
                :disabled="updatingStatus"
              >
                <PlayIcon class="w-4 h-4 mr-2" />
                Start Task
              </button>
              
              <button
                v-if="currentTask.status === 'in_progress'"
                @click="updateStatus('completed')"
                class="btn-success btn-sm"
                :disabled="updatingStatus"
              >
                <CheckIcon class="w-4 h-4 mr-2" />
                Mark Complete
              </button>
              
              <button
                v-if="currentTask.status === 'completed'"
                @click="updateStatus('pending')"
                class="btn-secondary btn-sm"
                :disabled="updatingStatus"
              >
                <ArrowUturnLeftIcon class="w-4 h-4 mr-2" />
                Reopen Task
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Not Found State -->
      <div v-else class="text-center py-12">
        <div class="p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
          <h3 class="text-gray-800 font-medium">Task not found</h3>
          <p class="text-gray-600 text-sm mt-1">The task you're looking for doesn't exist.</p>
          <button @click="goBack" class="btn-primary btn-sm mt-3">
            Go Back
          </button>
        </div>
      </div>
  
      <!-- Edit Modal -->
      <TaskModal
        v-if="showEditModal"
        :task="currentTask"
        :priorities="priorities"
        :tags="tags"
        :loading="modalLoading"
        @close="closeEditModal"
        @save="saveTask"
      />
  
      <!-- Delete Confirmation -->
      <ConfirmModal
        v-if="showDeleteModal"
        title="Delete Task"
        :message="`Are you sure you want to delete '${currentTask?.title}'? This action cannot be undone.`"
        :loading="modalLoading"
        @confirm="executeDelete"
        @cancel="closeDeleteModal"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    ClockIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    PlayIcon,
    CheckIcon,
    ArrowUturnLeftIcon
  } from '@heroicons/vue/24/outline'
  
  // Components
  import TaskStatusBadge from '@/components/tasks/TaskStatusBadge.vue'
  import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge.vue'
  import TaskModal from '@/components/tasks/TaskModal.vue'
  import ConfirmModal from '@/shared/ConfirmModal.vue'
  
  // Composables and stores
  import { useTasksStore } from '@/stores/useTasksStore'
  import { useNotifications } from '@/composables/useNotifications'
  import { useDateUtils } from '@/composables/useDateUtils'
  
  // Types
  import type { UpdateTaskDto, TaskStatus } from '@/types/task'
  
  interface Props {
    id: number
  }
  
  const props = defineProps<Props>()
  
  // Setup
  const router = useRouter()
  const route = useRoute()
  const tasksStore = useTasksStore()
  const { showSuccess, showError } = useNotifications()
  const { formatDate, formatDateTime } = useDateUtils()
  
  // Store state
  const {
    currentTask,
    loading,
    error,
    priorities,
    tags
  } = storeToRefs(tasksStore)
  
  // Local state
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const modalLoading = ref(false)
  const updatingStatus = ref(false)
  
  // Methods
  const loadTask = async (): Promise<void> => {
    try {
      await tasksStore.fetchTask(props.id)
    } catch (error) {
      showError('Failed to load task')
    }
  }
  
  const goBack = (): void => {
    router.push('/tasks')
  }
  
  const editTask = (): void => {
    showEditModal.value = true
  }
  
  const confirmDelete = (): void => {
    showDeleteModal.value = true
  }
  
  const closeEditModal = (): void => {
    showEditModal.value = false
    modalLoading.value = false
  }
  
  const closeDeleteModal = (): void => {
    showDeleteModal.value = false
    modalLoading.value = false
  }
  
  const saveTask = async (taskData: UpdateTaskDto): Promise<void> => {
    modalLoading.value = true
    
    try {
      await tasksStore.updateTask(props.id, taskData)
      showSuccess('Task updated successfully')
      closeEditModal()
    } catch (error: any) {
      showError(error.message || 'Failed to update task')
    } finally {
      modalLoading.value = false
    }
  }
  
  const executeDelete = async (): Promise<void> => {
    modalLoading.value = true
    
    try {
      await tasksStore.deleteTask(props.id)
      showSuccess('Task deleted successfully')
      router.push('/tasks')
    } catch (error: any) {
      showError(error.message || 'Failed to delete task')
    } finally {
      modalLoading.value = false
    }
  }
  
  const updateStatus = async (status: TaskStatus): Promise<void> => {
    updatingStatus.value = true
    
    try {
      await tasksStore.updateTask(props.id, { status })
      showSuccess(`Task status updated to ${status.replace('_', ' ')}`)
    } catch (error: any) {
      showError(error.message || 'Failed to update task status')
    } finally {
      updatingStatus.value = false
    }
  }
  
  // Error handling
  watch(error, (newError) => {
    if (newError) {
      showError(newError)
      tasksStore.clearError()
    }
  })
  
  // Watch for route changes
  watch(() => props.id, (newId) => {
    if (newId) {
      loadTask()
    }
  }, { immediate: true })
  
  // Lifecycle
  onMounted(async () => {
    if (props.id) {
      await loadTask()
    }
  })
  </script>