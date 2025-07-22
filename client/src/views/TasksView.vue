<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
          <p class="mt-2 text-gray-600">
            Manage your tasks - {{ tasks.length }} total
          </p>
        </div>
        
        <div class="mt-4 lg:mt-0 flex space-x-3">
          <button
            @click="openCreateModal"
            class="btn-primary"
          >
            <PlusIcon class="w-5 h-5 mr-2" />
            New Task
          </button>
          
          <button
            @click="refreshTasks"
            :disabled="loading"
            class="btn-outline"
          >
            <ArrowPathIcon 
              class="w-5 h-5 mr-2" 
              :class="{ 'animate-spin': loading }"
            />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <div class="p-3 bg-blue-100 rounded-lg">
              <PlayIcon class="w-8 h-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">In Progress</p>
              <p class="text-3xl font-bold text-gray-900">{{ inProgressTasks }}</p>
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

    <!-- Filters -->
    <div class="card mb-6">
      <div class="card-body">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Search tasks..."
                class="form-input pl-10"
                :disabled="loading"
              />
              <MagnifyingGlassIcon class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Status Filter -->
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="form-select"
            :disabled="loading"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <!-- Priority Filter -->
          <select
            v-if="priorities.length > 0"
            v-model="filters.priority_id"
            @change="applyFilters"
            class="form-select"
            :disabled="loading"
          >
            <option value="">All Priorities</option>
            <option v-for="priority in priorities" :key="priority.id" :value="priority.id">
              {{ priority.name }}
            </option>
          </select>

          <!-- Clear Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="btn-outline"
            :disabled="loading"
          >
            <XMarkIcon class="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <span
            v-if="searchQuery"
            class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700"
          >
            Search: {{ searchQuery }}
            <button @click="clearSearch" class="hover:bg-blue-200 rounded">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>

          <span
            v-if="filters.status"
            class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700"
          >
            Status: {{ getStatusLabel(filters.status) }}
            <button @click="clearStatusFilter" class="hover:bg-green-200 rounded">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>

          <span
            v-if="filters.priority_id"
            class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700"
          >
            Priority: {{ getPriorityName(filters.priority_id) }}
            <button @click="clearPriorityFilter" class="hover:bg-purple-200 rounded">
              <XMarkIcon class="w-3 h-3" />
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Tasks Table -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="table-header">
            <tr>
              <th>
                <input
                  type="checkbox"
                  :checked="allTasksSelected"
                  :indeterminate="someTasksSelected"
                  @change="toggleSelectAll"
                  class="form-checkbox"
                />
              </th>
              <th>Task</th>
              <th>Status</th>
              <th v-if="priorities.length > 0">Priority</th>
              <th>Due Date</th>
              <th>Created</th>
              <th class="w-32">Actions</th>
            </tr>
          </thead>
          
          <tbody class="table-body">
            <!-- Loading State -->
            <tr v-if="loading && tasks.length === 0">
              <td :colspan="priorities.length > 0 ? 7 : 6" class="table-cell text-center py-12">
                <div class="flex flex-col items-center space-y-3">
                  <div class="loading-spinner w-8 h-8"></div>
                  <span class="text-gray-500">Loading tasks...</span>
                </div>
              </td>
            </tr>
            
            <!-- Empty State -->
            <tr v-else-if="!loading && tasks.length === 0">
              <td :colspan="priorities.length > 0 ? 7 : 6" class="table-cell text-center py-12">
                <div class="flex flex-col items-center space-y-3">
                  <DocumentTextIcon class="w-12 h-12 text-gray-300" />
                  <div>
                    <p class="text-gray-500 text-lg font-medium">No tasks found</p>
                    <p class="text-gray-400 text-sm mt-1">
                      {{ hasActiveFilters ? 'Try adjusting your filters' : 'Create your first task to get started' }}
                    </p>
                  </div>
                  <button
                    v-if="!hasActiveFilters"
                    @click="openCreateModal"
                    class="btn-primary btn-sm"
                  >
                    <PlusIcon class="w-4 h-4 mr-2" />
                    Create Task
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Task Rows -->
            <tr v-else v-for="task in tasks" :key="task.id" class="table-row">
              <td class="table-cell">
                <input
                  type="checkbox"
                  :value="task.id"
                  v-model="selectedTasks"
                  class="form-checkbox"
                />
              </td>

              <td class="table-cell">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ task.title }}
                  </div>
                  <div v-if="task.description" class="text-sm text-gray-500 truncate max-w-xs">
                    {{ task.description }}
                  </div>
                  <div v-if="task.tags && task.tags.length > 0" class="mt-1 flex flex-wrap gap-1">
                    <span
                      v-for="tag in task.tags"
                      :key="tag.id"
                      class="badge-gray text-xs"
                    >
                      {{ tag.name }}
                    </span>
                  </div>
                </div>
              </td>

              <td class="table-cell">
                <TaskStatusBadge :status="task.status" />
              </td>

              <td v-if="priorities.length > 0" class="table-cell">
                <TaskPriorityBadge v-if="task.priority" :priority="task.priority" />
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>

              <td class="table-cell">
                <div v-if="task.due_date">
                  <div :class="getDateStatusClasses(task.due_date)">
                    {{ formatDate(task.due_date) }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ getRelativeDate(task.due_date) }}
                  </div>
                  <div v-if="task.is_overdue" class="text-xs text-red-600 font-medium">
                    Overdue
                  </div>
                </div>
                <span v-else class="text-gray-400 text-sm">No due date</span>
              </td>

              <td class="table-cell">
                <div class="text-sm text-gray-900">
                  {{ formatDate(task.created_at) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getTimeAgo(task.created_at) }}
                </div>
              </td>

              <td class="table-cell">
                <div class="flex space-x-2">
                  <button
                    @click="viewTask(task)"
                    class="text-blue-600 hover:text-blue-900 text-sm"
                    title="View details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="editTask(task)"
                    class="text-green-600 hover:text-green-900 text-sm"
                    title="Edit task"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDeleteTask(task)"
                    class="text-red-600 hover:text-red-900 text-sm"
                    title="Delete task"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Bulk Actions -->
      <div v-if="selectedTasks.length > 0" class="px-6 py-4 bg-blue-50 border-t border-blue-200">
        <div class="flex items-center justify-between">
          <span class="text-sm text-blue-700 font-medium">
            {{ selectedTasks.length }} task{{ selectedTasks.length !== 1 ? 's' : '' }} selected
          </span>
          <div class="flex space-x-2">
            <button @click="bulkUpdateStatus('completed')" class="btn-success btn-sm">
              Mark Complete
            </button>
            <button @click="confirmBulkDelete" class="btn-danger btn-sm">
              Delete Selected
            </button>
            <button @click="clearSelection" class="btn-outline btn-sm">
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ (pagination.current_page - 1) * pagination.per_page + 1 }} to 
            {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} of 
            {{ pagination.total }} results
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1 || loading"
              class="btn-outline btn-sm"
            >
              <ChevronLeftIcon class="w-4 h-4" />
              Previous
            </button>
            
            <span class="px-3 py-1 text-sm text-gray-700">
              Page {{ pagination.current_page }} of {{ pagination.last_page }}
            </span>
            
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page || loading"
              class="btn-outline btn-sm"
            >
              Next
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TaskModal
      v-if="showTaskModal"
      :task="selectedTask"
      :priorities="priorities"
      :tags="tags"
      :loading="modalLoading"
      @close="closeTaskModal"
      @save="saveTask"
    />

    <ConfirmModal
      v-if="showDeleteModal"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      :loading="modalLoading"
      @confirm="executeDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '@/types/task'

// Setup
const router = useRouter()
const tasksStore = useTasksStore()
const { showSuccess, showError, showLoading, dismiss } = useNotifications()
const { formatDate, getRelativeDate, getTimeAgo, getDateStatusClasses } = useDateUtils()

// Store state
const {
  tasks,
  loading,
  error,
  priorities,
  tags,
  pagination,
  filters,
  tasksByStatus
} = storeToRefs(tasksStore)

// Local state
const searchQuery = ref('')
const showTaskModal = ref(false)
const showDeleteModal = ref(false)
const selectedTask = ref<Task | null>(null)
const modalLoading = ref(false)
const taskToDelete = ref<Task | null>(null)
const selectedTasks = ref<number[]>([])

// Computed
const totalTasks = computed(() => tasks.value.length)
const pendingTasks = computed(() => tasksByStatus.value.pending.length)
const inProgressTasks = computed(() => tasksByStatus.value.in_progress.length)
const completedTasks = computed(() => tasksByStatus.value.completed.length)

const hasActiveFilters = computed(() => 
  searchQuery.value || filters.value.status || filters.value.priority_id
)

const allTasksSelected = computed(() => 
  tasks.value.length > 0 && selectedTasks.value.length === tasks.value.length
)

const someTasksSelected = computed(() => 
  selectedTasks.value.length > 0 && selectedTasks.value.length < tasks.value.length
)

const deleteModalTitle = computed(() => {
  if (selectedTasks.value.length > 1) {
    return `Delete ${selectedTasks.value.length} Tasks`
  }
  return taskToDelete.value ? `Delete "${taskToDelete.value.title}"` : 'Delete Task'
})

const deleteModalMessage = computed(() => {
  if (selectedTasks.value.length > 1) {
    return `Are you sure you want to delete ${selectedTasks.value.length} tasks? This action cannot be undone.`
  }
  return 'Are you sure you want to delete this task? This action cannot be undone.'
})

// Methods
const refreshTasks = async (): Promise<void> => {
  try {
    await tasksStore.fetchTasks()
    showSuccess('Tasks refreshed successfully')
  } catch (error) {
    showError('Failed to refresh tasks')
  }
}

const handleSearch = (): void => {
  applyFilters()
}

const applyFilters = (): void => {
  tasksStore.updateFilters({ 
    search: searchQuery.value,
    page: 1 
  })
}

const clearSearch = (): void => {
  searchQuery.value = ''
  applyFilters()
}

const clearStatusFilter = (): void => {
  filters.value.status = ''
  applyFilters()
}

const clearPriorityFilter = (): void => {
  filters.value.priority_id = ''
  applyFilters()
}

const clearAllFilters = (): void => {
  searchQuery.value = ''
  tasksStore.clearFilters()
  showSuccess('Filters cleared')
}

const changePage = (page: number): void => {
  tasksStore.fetchTasks(page)
}

// Selection methods
const toggleSelectAll = (): void => {
  if (allTasksSelected.value) {
    selectedTasks.value = []
  } else {
    selectedTasks.value = tasks.value.map(task => task.id)
  }
}

const clearSelection = (): void => {
  selectedTasks.value = []
}

// Task CRUD operations
const openCreateModal = (): void => {
  selectedTask.value = null
  showTaskModal.value = true
}

const viewTask = (task: Task): void => {
  router.push(`/tasks/${task.id}`)
}

const editTask = (task: Task): void => {
  selectedTask.value = task
  showTaskModal.value = true
}

const confirmDeleteTask = (task: Task): void => {
  taskToDelete.value = task
  selectedTasks.value = []
  showDeleteModal.value = true
}

const confirmBulkDelete = (): void => {
  if (selectedTasks.value.length === 0) return
  taskToDelete.value = null
  showDeleteModal.value = true
}

const closeTaskModal = (): void => {
  showTaskModal.value = false
  selectedTask.value = null
  modalLoading.value = false
}

const closeDeleteModal = (): void => {
  showDeleteModal.value = false
  taskToDelete.value = null
  modalLoading.value = false
}

const saveTask = async (taskData: CreateTaskDto | UpdateTaskDto): Promise<void> => {
  modalLoading.value = true
  
  try {
    if (selectedTask.value) {
      // Update existing task
      await tasksStore.updateTask(selectedTask.value.id, taskData as UpdateTaskDto)
      showSuccess('Task updated successfully')
    } else {
      // Create new task
      await tasksStore.createTask(taskData as CreateTaskDto)
      showSuccess('Task created successfully')
    }
    
    closeTaskModal()
  } catch (error: any) {
    showError(error.message || 'Failed to save task')
  } finally {
    modalLoading.value = false
  }
}

const executeDelete = async (): Promise<void> => {
  modalLoading.value = true
  
  try {
    if (selectedTasks.value.length > 0) {
      // Bulk delete
      await Promise.all(selectedTasks.value.map(id => tasksStore.deleteTask(id)))
      showSuccess(`${selectedTasks.value.length} tasks deleted successfully`)
      selectedTasks.value = []
    } else if (taskToDelete.value) {
      // Single delete
      await tasksStore.deleteTask(taskToDelete.value.id)
      showSuccess('Task deleted successfully')
    }
    
    closeDeleteModal()
  } catch (error: any) {
    showError(error.message || 'Failed to delete task(s)')
  } finally {
    modalLoading.value = false
  }
}

// Bulk operations
const bulkUpdateStatus = async (status: TaskStatus): Promise<void> => {
  if (selectedTasks.value.length === 0) return
  
  try {
    const loadingToast = showLoading(`Updating ${selectedTasks.value.length} tasks...`)
    
    await Promise.all(
      selectedTasks.value.map(id => tasksStore.updateTask(id, { status }))
    )
    
    dismiss(loadingToast)
    showSuccess(`${selectedTasks.value.length} tasks marked as ${status.replace('_', ' ')}`)
    selectedTasks.value = []
  } catch (error: any) {
    showError(error.message || 'Failed to update tasks')
  }
}

// Helper methods
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed'
  }
  return labels[status] || status
}

const getPriorityName = (priorityId: string | number): string => {
  const priority = priorities.value.find(p => p.id === Number(priorityId))
  return priority?.name || 'Unknown'
}

// Error handling
watch(error, (newError) => {
  if (newError) {
    showError(newError)
    tasksStore.clearError()
  }
})

// Watch for route changes to clear selection
watch(() => router.currentRoute.value.path, () => {
  selectedTasks.value = []
})

// Lifecycle
onMounted(async () => {
  await tasksStore.initialize()
})
</script>

<style scoped>
/* Custom checkbox indeterminate state */
input[type="checkbox"]:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 8h8'/%3e%3c/svg%3e");
}

/* Smooth transitions */
.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Loading states */
.loading-overlay {
  backdrop-filter: blur(2px);
}

/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>