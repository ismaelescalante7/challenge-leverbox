<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading && !task" class="text-center py-12">
      <div class="loading-spinner w-8 h-8 mx-auto mb-4"></div>
      <p class="text-gray-500">Loading task...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !task" class="text-center py-12">
      <div class="text-red-600 mb-4">
        <DocumentTextIcon class="w-12 h-12 mx-auto" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Task not found</h3>
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <router-link to="/tasks" class="btn-primary">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Back to Tasks
      </router-link>
    </div>

    <!-- Task Detail -->
    <div v-else-if="task" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <router-link to="/tasks" class="text-gray-400 hover:text-gray-500">
                <HomeIcon class="w-5 h-5" />
                <span class="sr-only">Tasks</span>
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
                <router-link to="/tasks" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Tasks
                </router-link>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
                <span class="ml-4 text-sm font-medium text-gray-500 truncate max-w-xs">
                  {{ task.title }}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Task Info Card -->
      <div class="card">
        <div class="card-body">
          <!-- Title and Status -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ task.title }}</h1>
              <div class="flex items-center space-x-4">
                <TaskStatusBadge :status="task.status" size="lg" />
                <TaskPriorityBadge v-if="task.priority" :priority="task.priority" size="lg" />
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="flex space-x-2">
              <button
                v-if="taskHelpers.getStatusValue(task) !== 'completed'"
                @click="markAsCompleted"
                class="btn-success btn-sm"
                :disabled="actionLoading"
              >
                <CheckCircleIcon class="w-4 h-4 mr-2" />
                Mark Complete
              </button>
              <button
                v-else
                @click="markAsPending"
                class="btn-outline btn-sm"
                :disabled="actionLoading"
              >
                <ClockIcon class="w-4 h-4 mr-2" />
                Mark Pending
              </button>
            </div>
          </div>

          <!-- Description -->
          <div v-if="task.description" class="mb-6">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p class="text-gray-700 whitespace-pre-wrap">{{ task.description }}</p>
          </div>

          <!-- Metadata Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Due Date -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Due Date</h3>
              <div v-if="task.dates?.due_date">
                <p :class="getDateStatusClasses(task.dates.due_date)">
                  {{ formatDate(task.dates.due_date) }}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ getRelativeDate(task.dates.due_date) }}
                </p>
                <div v-if="task.dates.is_overdue" class="text-sm text-red-600 font-medium mt-1">
                  ⚠️ Overdue
                </div>
              </div>
              <p v-else class="text-gray-400">No due date set</p>
            </div>

            <!-- Priority -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Priority</h3>
              <div v-if="task.priority">
                <p class="text-gray-900">{{ task.priority.label || task.priority.name }}</p>
                <p class="text-sm text-gray-500">Level {{ task.priority.level || 'N/A' }}</p>
              </div>
              <p v-else class="text-gray-400">No priority set</p>
            </div>

            <!-- Status -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Status</h3>
              <p class="text-gray-900 capitalize">{{ taskHelpers.getStatusLabel(task) }}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <button
                  v-for="status in availableStatuses"
                  :key="status.value"
                  @click="changeStatus(status.value)"
                  :disabled="taskHelpers.getStatusValue(task) === status.value || actionLoading"
                  class="btn-outline btn-xs"
                  :class="{
                    'opacity-50 cursor-not-allowed': taskHelpers.getStatusValue(task) === status.value
                  }"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="task.tags && task.tags.length > 0">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in task.tags"
                  :key="tag.id"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="{ 
                    backgroundColor: tag.color + '20', 
                    color: tag.color, 
                    borderColor: tag.color 
                  }"
                  style="border: 1px solid;"
                >
                  {{ tag.label || tag.name }}
                </span>
              </div>
            </div>

            <!-- Created -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Created</h3>
              <p class="text-gray-900">{{ formatDate(task.dates?.created_at) }}</p>
              <p class="text-sm text-gray-500">{{ getTimeAgo(task.dates?.created_at) }}</p>
            </div>

            <!-- Last Updated -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Last Updated</h3>
              <p class="text-gray-900">{{ formatDate(task.dates?.updated_at) }}</p>
              <p class="text-sm text-gray-500">{{ getTimeAgo(task.dates?.updated_at) }}</p>
            </div>
          </div>

          <!-- Urgency Indicator -->
          <div v-if="task.meta?.urgency_level && task.meta.urgency_level !== 'low'" class="mt-6 p-4 rounded-lg"
               :class="{
                 'bg-yellow-50 border border-yellow-200': task.meta.urgency_level === 'medium',
                 'bg-red-50 border border-red-200': task.meta.urgency_level === 'high'
               }">
            <div class="flex items-center">
              <ExclamationTriangleIcon 
                class="w-5 h-5 mr-2"
                :class="{
                  'text-yellow-600': task.meta.urgency_level === 'medium',
                  'text-red-600': task.meta.urgency_level === 'high'
                }"
              />
              <span 
                class="font-medium capitalize"
                :class="{
                  'text-yellow-800': task.meta.urgency_level === 'medium',
                  'text-red-800': task.meta.urgency_level === 'high'
                }"
              >
                {{ task.meta.urgency_level }} Priority Task
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <TaskModal
      v-if="showEditModal"
      :task="task"
      :priorities="priorities"
      :tags="tags"
      :loading="modalLoading"
      @close="closeEditModal"
      @save="saveTask"
    />

    <ConfirmModal
      v-if="showDeleteModal"
      title="Delete Task"
      :message="`Are you sure you want to delete '${task?.title}'? This action cannot be undone.`"
      :loading="modalLoading"
      @confirm="executeDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import '@/assets/styles/task-detail-view.css'
import {
  ArrowLeftIcon,
  HomeIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
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
import { taskHelpers } from '@/services/taskService'

// Types
import type { Task, UpdateTaskDto, TaskStatus } from '@/types/task'

// Setup
const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()
const { showSuccess, showError } = useNotifications()
const { formatDate, getRelativeDate, getTimeAgo, getDateStatusClasses } = useDateUtils()

// Store state
const {
  currentTask: task,
  loading,
  error,
  priorities,
  tags
} = storeToRefs(tasksStore)

// Local state
const actionLoading = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const modalLoading = ref(false)

// Available statuses for quick change
const availableStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
]


const closeEditModal = (): void => {
  showEditModal.value = false
  modalLoading.value = false
}

const closeDeleteModal = (): void => {
  showDeleteModal.value = false
  modalLoading.value = false
}

const saveTask = async (taskData: UpdateTaskDto): Promise<void> => {
  if (!task.value) return
  
  modalLoading.value = true
  
  try {
    await tasksStore.updateTask(task.value.id, taskData)
    showSuccess('Task updated successfully')
    closeEditModal()
  } catch (error: any) {
    showError(error.message || 'Failed to update task')
  } finally {
    modalLoading.value = false
  }
}

const executeDelete = async (): Promise<void> => {
  if (!task.value) return
  
  modalLoading.value = true
  
  try {
    await tasksStore.deleteTask(task.value.id)
    showSuccess('Task deleted successfully')
    router.push('/tasks')
  } catch (error: any) {
    showError(error.message || 'Failed to delete task')
  } finally {
    modalLoading.value = false
  }
}

const changeStatus = async (newStatus: TaskStatus): Promise<void> => {
  if (!task.value || actionLoading.value) return
  
  actionLoading.value = true
  
  try {
    await tasksStore.updateTaskStatus?.(task.value.id, newStatus)
    
    showSuccess(`Task marked as ${newStatus.replace('_', ' ')}`)
  } catch (error: any) {
    showError(error.message || 'Failed to update task status')
  } finally {
    actionLoading.value = false
  }
}

const markAsCompleted = (): void => {
  changeStatus('completed')
}

const markAsPending = (): void => {
  changeStatus('pending')
}

// Lifecycle
onMounted(async () => {
  const taskId = Number(route.params.id)
  
  if (isNaN(taskId)) {
    showError('Invalid task ID')
    router.push('/tasks')
    return
  }
  
  try {
    await tasksStore.fetchTask(taskId)
    
    if (!task.value) {
      showError('Task not found')
      router.push('/tasks')
    }
  } catch (error: any) {
    showError(error.message || 'Failed to load task')
  }
})
</script>