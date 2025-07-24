<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 🔍 DEBUG Panel (temporal) -->
    <div v-if="debugMode" class="debug-panel mb-6">
      <h4>🔍 DEBUG INFO - Dashboard:</h4>
      <p><strong>Store loading:</strong> {{ loading }}</p>
      <p><strong>Store initialized:</strong> {{ initialized }}</p>
      <p><strong>Total tasks:</strong> {{ tasks.length }}</p>
      <p><strong>Stats:</strong> {{ JSON.stringify(taskStats) }}</p>
      <p><strong>tasksByStatus pending:</strong> {{ tasksByStatus.pending.length }}</p>
      <p><strong>tasksByStatus in_progress:</strong> {{ tasksByStatus.in_progress.length }}</p>
      <p><strong>tasksByStatus completed:</strong> {{ tasksByStatus.completed.length }}</p>
      <details>
        <summary>Full Tasks Array (first 3)</summary>
        <pre>{{ JSON.stringify(tasks.slice(0, 3), null, 2) }}</pre>
      </details>
      <button @click="debugMode = false" class="btn-debug">Hide Debug</button>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-gray-600">
        Welcome back! Here's an overview of your tasks.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !initialized" class="text-center py-12">
      <div class="loading-spinner w-8 h-8 mx-auto mb-4"></div>
      <p class="text-gray-500">Loading dashboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-alert mb-6">
      <div class="error-content">
        <ExclamationTriangleIcon class="error-icon" />
        <div class="error-text">
          <h3 class="error-title">Failed to load dashboard</h3>
          <p class="error-message">{{ error.message }}</p>
        </div>
        <button @click="retryLoad" class="btn-outline btn-sm">
          Try Again
        </button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats Cards con variantes de status -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Tasks"
          :value="totalTasks"
          :icon="DocumentTextIcon"
          variant="primary"
          :trend="totalTasksTrend"
        />
        
        <StatsCard
          label="Pending"
          :value="pendingTasks"
          :icon="ClockIcon"
          variant="pending"
          :subtitle="pendingTasks === 1 ? 'task' : 'tasks'"
        />

        <StatsCard
          label="In Progress"
          :value="inProgressTasks"
          :icon="PlayIcon"
          variant="in_progress"
          :subtitle="inProgressTasks === 1 ? 'task' : 'tasks'"
        />
        
        <StatsCard
          label="Completed"
          :value="completedTasks"
          :icon="CheckCircleIcon"
          variant="completed"
          :trend="completedTasksTrend"
        />
      </div>

      <!-- Task Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Pending Tasks -->
        <TaskList
          title="Pending Tasks"
          :tasks="tasksByStatus.pending"
          variant="pending"
          :limit="5"
          view-all-link="/tasks?status=pending"
          empty-message="No pending tasks"
          empty-subtext="Great job!"
          :empty-action="{ text: 'Create a new task', link: '/tasks' }"
          :allow-mark-complete="true"
          :action-loading="actionLoading"
          @mark-as-completed="markAsCompleted"
        />

        <!-- In Progress Tasks -->
        <TaskList
          title="In Progress"
          :tasks="tasksByStatus.in_progress"
          variant="progress"
          :limit="5"
          view-all-link="/tasks?status=in_progress"
          empty-message="No tasks in progress"
          :empty-action="{ text: 'Start working on a task', link: '/tasks' }"
          :allow-mark-complete="true"
          :action-loading="actionLoading"
          @mark-as-completed="markAsCompleted"
        />
      </div>

      <!-- Recently Completed -->
      <div v-if="recentlyCompleted.length > 0" class="mb-8">
        <TaskList
          title="Recently Completed"
          :tasks="recentlyCompleted"
          variant="completed"
          :limit="3"
          :allow-mark-complete="false"
          :show-actions="false"
          view-all-link="/tasks?status=completed"
          empty-message="No completed tasks yet"
        />
      </div>

      <!-- Quick Actions -->
      <QuickActions
        title="Quick Actions"
        :primary-actions="primaryActions"
      >
        <div class="text-sm text-gray-600">
          <p>Manage your tasks efficiently with these quick shortcuts.</p>
        </div>
      </QuickActions>
    </div>

    <!-- Create Task Modal -->
    <TaskModal
      v-if="showCreateModal"
      :priorities="priorities"
      :tags="tags"
      :loading="modalLoading"
      :error="error"
      @close="closeCreateModal"
      @save="createTask"
      @clear-error="tasksStore.clearError"
    />

    <!-- Debug Toggle Button -->
    <button
      v-if="!debugMode"
      @click="debugMode = true"
      class="fixed bottom-4 right-16 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      title="Show Debug Info (Dashboard)"
    >
      📊
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlayIcon
} from '@heroicons/vue/24/outline'

// Components
import StatsCard from '@/components/shared/StatsCard.vue'
import TaskList from '@/components/shared/TaskList.vue'
import QuickActions from '@/components/shared/QuickActions.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'

// Composables and stores
import { useTasksStore } from '@/stores/useTasksStore'
import { useNotifications } from '@/composables/useNotifications'
import { taskHelpers } from '@/services/taskService'

// Types
import type { CreateTaskDto } from '@/types/task'

// Setup
const tasksStore = useTasksStore()
const { showSuccess, showError } = useNotifications()

// Debug mode
const debugMode = ref(false)

// Store state
const {
  tasks,
  priorities,
  tags,
  tasksByStatus,
  taskStats,
  loading,
  error,
  initialized
} = storeToRefs(tasksStore)

// Local state
const showCreateModal = ref(false)
const modalLoading = ref(false)
const actionLoading = ref(false)

// 🎯 COMPUTED CORREGIDOS para funcionar con datos reales
const totalTasks = computed(() => {
  console.log('🔍 Dashboard totalTasks computed - taskStats:', taskStats.value)
  return taskStats.value?.total || tasks.value.length || 0
})

const pendingTasks = computed(() => {
  console.log('🔍 Dashboard pendingTasks computed - taskStats:', taskStats.value?.pending)
  return taskStats.value?.pending || tasksByStatus.value.pending.length || 0
})

const inProgressTasks = computed(() => {
  console.log('🔍 Dashboard inProgressTasks computed - taskStats:', taskStats.value?.in_progress)
  return taskStats.value?.in_progress || tasksByStatus.value.in_progress.length || 0
})

const completedTasks = computed(() => {
  console.log('🔍 Dashboard completedTasks computed - taskStats:', taskStats.value?.completed)
  return taskStats.value?.completed || tasksByStatus.value.completed.length || 0
})

// 🎯 RECENTLY COMPLETED CORREGIDO para usar estructura TaskDates
const recentlyCompleted = computed(() => {
  console.log('🔍 Dashboard recentlyCompleted computing...')
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const completed = tasksByStatus.value.completed
    .filter(task => {
      // ✅ Usar task.dates.updated_at (estructura real)
      if (!task.dates?.updated_at) return false
      const updatedDate = new Date(task.dates.updated_at)
      const isRecent = updatedDate >= sevenDaysAgo
      console.log(`🔍 Task ${task.id}: updated_at=${task.dates.updated_at}, isRecent=${isRecent}`)
      return isRecent
    })
    .slice(0, 5)
    
  console.log('🔍 Dashboard recentlyCompleted result:', completed.length)
  return completed
})

// Trends (mock data - replace with real calculation)
const totalTasksTrend = computed(() => ({
  value: 12,
  unit: '%',
  label: 'vs last month',
  direction: 'up' as const
}))

const completedTasksTrend = computed(() => ({
  value: 8,
  unit: '%',
  label: 'completion rate',
  direction: 'up' as const
}))

// Quick Actions Configuration
const primaryActions = computed(() => [
  {
    key: 'view-tasks',
    label: 'View All Tasks',
    icon: DocumentTextIcon,
    component: 'router-link' as const,
    to: '/tasks'
  },
  {
    key: 'create-task',
    label: 'Create New Task',
    icon: PlusIcon,
    onClick: openCreateModal
  }
])

// Methods
const retryLoad = async (): Promise<void> => {
  console.log('🔍 Dashboard retrying load...')
  try {
    tasksStore.clearError()
    await tasksStore.refreshAll()
    showSuccess('Dashboard refreshed successfully!')
  } catch (error) {
    console.error('💥 Dashboard retry failed:', error)
  }
}

const openCreateModal = (): void => {
  console.log('🔍 Dashboard opening create modal')
  showCreateModal.value = true
  tasksStore.clearError()
}

const closeCreateModal = (): void => {
  console.log('🔍 Dashboard closing create modal')
  showCreateModal.value = false
  modalLoading.value = false
  tasksStore.clearError()
}

// 🎯 CREATE TASK CON GESTIÓN DE ERRORES
const createTask = async (taskData: CreateTaskDto): Promise<void> => {
  console.log('🔍 Dashboard createTask called with:', taskData)
  modalLoading.value = true
  
  try {
    await tasksStore.createTask(taskData)
    showSuccess('Task created successfully')
    closeCreateModal()
  } catch (error: any) {
    console.error('💥 Dashboard createTask failed:', error)
    
    // NO cerrar el modal para errores de validación
    if (error?.type !== 'validation') {
      showError(error.message || 'Failed to create task')
    }
  } finally {
    modalLoading.value = false
  }
}

const markAsCompleted = async (taskId: number): Promise<void> => {
  console.log('🔍 Dashboard markAsCompleted called for task:', taskId)
  actionLoading.value = true
  
  try {
    // Usar updateTaskStatus si existe, sino updateTask
    if (tasksStore.updateTaskStatus) {
      await tasksStore.updateTaskStatus(taskId, 'completed')
    } else {
      await tasksStore.updateTask(taskId, { status: 'completed' })
    }
    
    showSuccess('Task marked as completed')
  } catch (error: any) {
    console.error('💥 Dashboard markAsCompleted failed:', error)
    showError(error.message || 'Failed to update task')
  } finally {
    actionLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🔍 Dashboard mounted')
  console.log('🔍 Dashboard - initialized:', initialized.value)
  console.log('🔍 Dashboard - total tasks:', totalTasks.value)
  
  // Solo inicializar si no está inicializado
  if (!initialized.value) {
    console.log('🔍 Dashboard - Initializing store...')
    try {
      await tasksStore.initialize()
      console.log('🔍 Dashboard - Store initialized successfully')
    } catch (error) {
      console.error('💥 Dashboard - Store initialization failed:', error)
    }
  } else {
    console.log('🔍 Dashboard - Store already initialized')
  }
})
</script>

<style scoped>
/* Debug panel */
.debug-panel {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.debug-panel h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.debug-panel p {
  margin: 0.25rem 0;
  color: #6b7280;
}

.debug-panel details {
  margin-top: 0.5rem;
}

.debug-panel pre {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.5rem;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.btn-debug {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Error Alert */
.error-alert {
  border-radius: 0.5rem;
}

.error-content {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #ef4444;
  margin-right: 0.75rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 0.25rem 0;
}

.error-message {
  font-size: 0.875rem;
  color: #7f1d1d;
  margin: 0;
}

.btn-outline {
  @apply inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

/* Loading spinner */
.loading-spinner {
  @apply animate-spin rounded-full border-2 border-gray-300 border-t-blue-600;
}
</style>