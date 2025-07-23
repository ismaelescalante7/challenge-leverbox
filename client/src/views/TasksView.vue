<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header con estadísticas -->
    <TasksHeader
      :total-tasks="totalTasks"
      :pending-tasks="pendingTasks"
      :in-progress-tasks="inProgressTasks"
      :completed-tasks="completedTasks"
      :loading="loading"
      @create="openCreateModal"
      @refresh="refreshTasks"
    />

    <!-- Filtros -->
    <TasksFilters
      v-model:search-query="searchQuery"
      v-model:filters="filters"
      :priorities="priorities"
      :loading="loading"
      @search="applyFilters"
      @clear-all-filters="clearAllFilters"
    />

    <!-- Tabla de tareas componentizada -->
    <TasksTable
      :tasks="tasks"
      :priorities="priorities"
      v-model:selected-tasks="selectedTasks"
      :pagination="pagination"
      :loading="loading"
      :has-active-filters="hasActiveFilters"
      :empty-title="emptyStateTitle"
      :empty-message="emptyStateMessage"
      :empty-action="hasActiveFilters ? undefined : 'Create Task'"
      @view-task="viewTask"
      @edit-task="editTask"
      @delete-task="confirmDeleteTask"
      @bulk-action="handleBulkAction"
      @page-change="changePage"
      @empty-action="openCreateModal"
    />

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

// Components
import TasksHeader from '@/components/tasks/TasksHeader.vue'
import TasksFilters from '@/components/tasks/TasksFilters.vue'
import TasksTable from '@/components/tasks/TasksTable.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'
import ConfirmModal from '@/shared/ConfirmModal.vue'

// Composables and stores
import { useTasksStore } from '@/stores/useTasksStore'
import { useNotifications } from '@/composables/useNotifications'

// Types
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '@/types/task'

// Setup
const router = useRouter()
const tasksStore = useTasksStore()
const { showSuccess, showError, showLoading, dismiss } = useNotifications()

// Store state
const {
  tasks,
  loading,
  error,
  priorities,
  tags,
  pagination,
  filters,
  taskStats
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
const totalTasks = computed(() => taskStats.value?.total || 0)
const pendingTasks = computed(() => taskStats.value?.pending || 0)
const inProgressTasks = computed(() => taskStats.value?.in_progress || 0)
const completedTasks = computed(() => taskStats.value?.completed || 0)

const hasActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value || 
    filters.value?.status || 
    filters.value?.priority_id
  )
})

const emptyStateTitle = computed(() => 
  hasActiveFilters.value ? 'No tasks found' : 'No tasks yet'
)

const emptyStateMessage = computed(() => 
  hasActiveFilters.value 
    ? 'Try adjusting your filters to find what you\'re looking for'
    : 'Create your first task to get started with task management'
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

const applyFilters = (): void => {
  // Construir objeto de filtros
  const filterParams: any = {
    page: 1 // Resetear a página 1 cuando se aplican filtros
  }
  
  if (searchQuery.value.trim()) {
    filterParams.search = searchQuery.value.trim()
  }
  
  if (filters.value?.status) {
    filterParams.status = filters.value.status
  }
  
  if (filters.value?.priority_id) {
    filterParams.priority_id = filters.value.priority_id
  }
  
  // Aplicar filtros usando el store
  tasksStore.updateFilters(filterParams)
}

const clearAllFilters = (): void => {
  searchQuery.value = ''
  // Limpiar filtros en el store
  tasksStore.clearFilters()
  showSuccess('Filters cleared')
}

const changePage = (page: number): void => {
  tasksStore.fetchTasks(page)
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
      await tasksStore.updateTask(selectedTask.value.id, taskData as UpdateTaskDto)
      showSuccess('Task updated successfully')
    } else {
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
      // Bulk delete usando el método del store si existe
      if (tasksStore.bulkDeleteTasks) {
        await tasksStore.bulkDeleteTasks(selectedTasks.value)
      } else {
        await Promise.all(selectedTasks.value.map(id => tasksStore.deleteTask(id)))
      }
      showSuccess(`${selectedTasks.value.length} tasks deleted successfully`)
      selectedTasks.value = []
    } else if (taskToDelete.value) {
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

// Bulk operations handler
const handleBulkAction = async (data: { action: string, taskIds: number[] }): Promise<void> => {
  if (data.taskIds.length === 0) return
  
  try {
    switch (data.action) {
      case 'complete':
        await bulkUpdateStatus('completed', data.taskIds)
        break
      case 'delete':
        confirmBulkDelete(data.taskIds)
        break
    }
  } catch (error: any) {
    showError(error.message || `Failed to ${data.action} tasks`)
  }
}

const bulkUpdateStatus = async (status: TaskStatus, taskIds: number[]): Promise<void> => {
  const loadingToast = showLoading(`Updating ${taskIds.length} tasks...`)
  
  try {
    // Usar bulkUpdateTasks del store si existe
    if (tasksStore.bulkUpdateTasks) {
      await tasksStore.bulkUpdateTasks(taskIds, { status })
    } else {
      await Promise.all(
        taskIds.map(id => tasksStore.updateTask(id, { status }))
      )
    }
    
    dismiss(loadingToast)
    showSuccess(`${taskIds.length} tasks marked as ${status.replace('_', ' ')}`)
    selectedTasks.value = []
  } catch (error: any) {
    dismiss(loadingToast)
    throw error
  }
}

const confirmBulkDelete = (taskIds: number[]): void => {
  if (taskIds.length === 0) return
  selectedTasks.value = taskIds
  taskToDelete.value = null
  showDeleteModal.value = true
}

// Watch for filters changes to auto-apply
watch([searchQuery, () => filters.value], () => {
  applyFilters()
}, { deep: true })

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