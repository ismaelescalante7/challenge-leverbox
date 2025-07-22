<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-2 text-gray-600">
          Welcome back! Here's an overview of your tasks.
        </p>
      </div>
  
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon class="w-8 h-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Tasks</p>
                <p class="text-3xl font-bold text-gray-900">{{ totalTasks }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon class="w-8 h-8 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Pending</p>
                <p class="text-3xl font-bold text-gray-900">{{ pendingTasks }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon class="w-8 h-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completed</p>
                <p class="text-3xl font-bold text-gray-900">{{ completedTasks }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Recent Tasks -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Pending Tasks -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Pending Tasks</h3>
              <router-link to="/tasks?status=pending" class="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </router-link>
            </div>
          </div>
          <div class="card-body">
            <div v-if="tasksByStatus.pending.length === 0" class="text-center py-8">
              <CheckCircleIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">No pending tasks</p>
              <p class="text-gray-400 text-sm">Great job!</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="task in tasksByStatus.pending.slice(0, 5)"
                :key="task.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex-1">
                  <router-link
                    :to="`/tasks/${task.id}`"
                    class="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {{ task.title }}
                  </router-link>
                  <div class="flex items-center mt-1 space-x-2">
                    <TaskPriorityBadge
                      v-if="task.priority"
                      :priority="task.priority"
                    />
                    <span v-if="task.due_date" class="text-xs text-gray-500">
                      Due {{ formatDate(task.due_date) }}
                    </span>
                  </div>
                </div>
                <button
                  @click="markAsCompleted(task.id)"
                  class="ml-4 p-1 text-gray-400 hover:text-green-600"
                  title="Mark as completed"
                >
                  <CheckIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- In Progress Tasks -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">In Progress</h3>
              <router-link to="/tasks?status=in_progress" class="text-blue-600 hover:text-blue-700 text-sm">
                View all
              </router-link>
            </div>
          </div>
          <div class="card-body">
            <div v-if="tasksByStatus.in_progress.length === 0" class="text-center py-8">
              <PlayIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">No tasks in progress</p>
              <router-link to="/tasks" class="text-blue-600 hover:text-blue-700 text-sm">
                Start working on a task
              </router-link>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="task in tasksByStatus.in_progress.slice(0, 5)"
                :key="task.id"
                class="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div class="flex-1">
                  <router-link
                    :to="`/tasks/${task.id}`"
                    class="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {{ task.title }}
                  </router-link>
                  <div class="flex items-center mt-1 space-x-2">
                    <TaskPriorityBadge
                      v-if="task.priority"
                      :priority="task.priority"
                    />
                    <span v-if="task.due_date" class="text-xs text-gray-500">
                      Due {{ formatDate(task.due_date) }}
                    </span>
                  </div>
                </div>
                <button
                  @click="markAsCompleted(task.id)"
                  class="ml-4 p-1 text-gray-400 hover:text-green-600"
                  title="Mark as completed"
                >
                  <CheckIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Quick Actions -->
      <div class="mt-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div class="card-body">
            <div class="flex flex-wrap gap-4">
              <router-link to="/tasks" class="btn-primary">
                <DocumentTextIcon class="w-5 h-5 mr-2" />
                View All Tasks
              </router-link>
              <button @click="openCreateModal" class="btn-outline">
                <PlusIcon class="w-5 h-5 mr-2" />
                Create New Task
              </button>
            </div>
          </div>
        </div>
      </div>
  
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
    CheckIcon,
    PlayIcon,
    PlusIcon
  } from '@heroicons/vue/24/outline'
  
  // Components
  import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge.vue'
  import TaskModal from '@/components/tasks/TaskModal.vue'
  
  // Composables and stores
  import { useTasksStore } from '@/stores/useTasksStore'
  import { useNotifications } from '@/composables/useNotifications'
  import { useDateUtils } from '@/composables/useDateUtils'
  
  // Types
  import type { CreateTaskDto } from '@/types/task'
  
  // Setup
  const tasksStore = useTasksStore()
  const { showSuccess, showError } = useNotifications()
  const { formatDate } = useDateUtils()
  
  // Store state
  const {
    tasks,
    loading,
    priorities,
    tags,
    tasksByStatus
  } = storeToRefs(tasksStore)
  
  // Local state
  const showCreateModal = ref(false)
  const modalLoading = ref(false)
  
  // Computed
  const totalTasks = computed(() => tasks.value.length)
  const pendingTasks = computed(() => tasksByStatus.value.pending.length)
  const completedTasks = computed(() => tasksByStatus.value.completed.length)
  
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
    try {
      await tasksStore.updateTask(taskId, { status: 'completed' })
      showSuccess('Task marked as completed')
    } catch (error: any) {
      showError(error.message || 'Failed to update task')
    }
  }
  
  // Lifecycle
  onMounted(async () => {
    if (!tasksStore.tasks.length) {
      await tasksStore.initialize()
    }
  })
  </script>