<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
import '@/assets/styles/dashboard.css'
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