<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-gray-600">
        Welcome back! Here's an overview of your tasks.
      </p>
    </div>

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

    <!-- Create Task Modal -->
    <TaskModal
      v-if="showCreateModal"
      :priorities="priorities"
      :tags="tags"
      :loading="modalLoading"
      @close="closeCreateModal"
      @save="createTask"
    />
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

// Store state
const {
  tasks,
  priorities,
  tags,
  tasksByStatus,
  taskStats
} = storeToRefs(tasksStore)

// Local state
const showCreateModal = ref(false)
const modalLoading = ref(false)
const actionLoading = ref(false)

// Computed
const totalTasks = computed(() => taskStats.value.total)
const pendingTasks = computed(() => taskStats.value.pending)
const inProgressTasks = computed(() => taskStats.value.in_progress)
const completedTasks = computed(() => taskStats.value.completed)

// Recently completed tasks (last 7 days)
const recentlyCompleted = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  return tasksByStatus.value.completed
    .filter(task => {
      if (!task.dates?.updated_at) return false
      const updatedDate = new Date(task.dates.updated_at)
      return updatedDate >= sevenDaysAgo
    })
    .slice(0, 5)
})

// Overdue tasks
const overdueTasks = computed(() => {
  return tasks.value.filter(task => task.dates?.is_overdue)
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
const openCreateModal = (): void => {
  showCreateModal.value = true
}

const closeCreateModal = (): void => {
  showCreateModal.value = false
  modalLoading.value = false
}

const createTask = async (taskData: CreateTaskDto): Promise<void> => {
  modalLoading.value = true
  
  try {
    await tasksStore.createTask(taskData)
    showSuccess('Task created successfully')
    closeCreateModal()
  } catch (error: any) {
    showError(error.message || 'Failed to create task')
  } finally {
    modalLoading.value = false
  }
}

const markAsCompleted = async (taskId: number): Promise<void> => {
  actionLoading.value = true
  
  try {
    await tasksStore.updateTaskStatus?.(taskId, 'completed') ||
          tasksStore.updateTask(taskId, { status: 'completed' })
    
    showSuccess('Task marked as completed')
  } catch (error: any) {
    showError(error.message || 'Failed to update task')
  } finally {
    actionLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (taskStats.value.total === 0) {
    await tasksStore.initialize()
  }
})
</script>