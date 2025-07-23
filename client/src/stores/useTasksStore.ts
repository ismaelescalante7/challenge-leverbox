import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService, taskHelpers } from '@/services/taskService'
import type { 
  Task, 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskFilters, 
  Priority, 
  Tag, 
  TasksApiResponse,
  PaginationInfo,
  AvailableFilters
} from '@/types/task'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const priorities = ref<Priority[]>([])
  const tags = ref<Tag[]>([])
  
  // Pagination actualizada
  const pagination = ref<PaginationInfo>({
    current_page: 1,
    from: 1,
    last_page: 1,
    per_page: 10,
    to: 0,
    total: 0,
    has_more_pages: false
  })
  
  // Filtros disponibles del API
  const availableFilters = ref<AvailableFilters | null>(null)
  
  // Filtros actuales
  const filters = ref<TaskFilters>({
    status: '',
    priority_id: '',
    search: '',
    page: 1,
    per_page: 10,
    sort_by: 'created_at',
    sort_direction: 'desc',
    overdue: false,
    tag_ids: []
  })

  // Computed usando helpers
  const tasksByStatus = computed(() => ({
    pending: tasks.value.filter(task => taskHelpers.getStatusValue(task) === 'pending'),
    in_progress: tasks.value.filter(task => taskHelpers.getStatusValue(task) === 'in_progress'),
    completed: tasks.value.filter(task => taskHelpers.getStatusValue(task) === 'completed')
  }))

  const overdueTasks = computed(() => 
    tasks.value.filter(task => taskHelpers.isOverdue(task))
  )

  const editableTasks = computed(() => 
    tasks.value.filter(task => taskHelpers.canEdit(task))
  )

  const taskStats = computed(() => ({
    total: tasks.value.length,
    pending: tasksByStatus.value.pending.length,
    in_progress: tasksByStatus.value.in_progress.length,
    completed: tasksByStatus.value.completed.length,
    overdue: overdueTasks.value.length
  }))

  // Actions
  const fetchTasks = async (page?: number): Promise<void> => {
    console.log('📥 Store: Fetching tasks...')
    loading.value = true
    error.value = null
    
    try {
      // Crear filtros limpios
      const cleanFilters: Record<string, any> = {
        page: page || filters.value.page || 1,
        per_page: filters.value.per_page || 10,
        sort_by: filters.value.sort_by || 'created_at',
        sort_direction: filters.value.sort_direction || 'desc'
      }
      
      // Solo agregar filtros que tienen valor
      if (filters.value.status && filters.value.status !== '') {
        cleanFilters.status = filters.value.status
      }
      
      if (filters.value.search && filters.value.search !== '') {
        cleanFilters.search = filters.value.search
      }
      
      if (filters.value.priority_id && filters.value.priority_id !== '') {
        cleanFilters.priority_id = filters.value.priority_id
      }
      
      if (typeof filters.value.overdue === 'boolean') {
        cleanFilters.overdue = filters.value.overdue
      }
      
      if (Array.isArray(filters.value.tag_ids) && filters.value.tag_ids.length > 0) {
        cleanFilters.tag_ids = [...filters.value.tag_ids]
      }
      
      console.log('📤 Store sending filters:', cleanFilters)
      
      const response: TasksApiResponse = await taskService.getTasks(cleanFilters)
      
      // Actualizar state con nueva estructura
      tasks.value = response.data
      pagination.value = response.pagination
      availableFilters.value = response.filters
      
      console.log('📋 Tasks loaded:', tasks.value.length)
      console.log('📊 Sample task structure:', tasks.value[0])
      
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks'
      console.error('💥 Store fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTask = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      currentTask.value = await taskService.getTask(id)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task'
    } finally {
      loading.value = false
    }
  }

  const createTask = async (data: CreateTaskDto): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const newTask = await taskService.createTask(data)
      tasks.value.unshift(newTask)
    } catch (err: any) {
      error.value = err.message || 'Failed to create task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: number, data: UpdateTaskDto): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const updatedTask = await taskService.updateTask(id, data)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters: Partial<TaskFilters>): void => {
    Object.assign(filters.value, newFilters)
    fetchTasks()
  }

  const clearFilters = (): void => {
    filters.value = {
      status: '',
      priority_id: '',
      search: '',
      page: 1,
      per_page: 10,
      sort_by: 'created_at',
      sort_direction: 'desc',
      overdue: false,
      tag_ids: []
    }
    fetchTasks()
  }

  const clearError = (): void => {
    error.value = null
  }

  const initialize = async (): Promise<void> => {
    await fetchTasks()
  }

  return {
    // State
    tasks,
    currentTask,
    loading,
    error,
    priorities,
    tags,
    pagination,
    filters,
    availableFilters,
    
    // Computed
    tasksByStatus,
    overdueTasks,
    editableTasks,
    taskStats,
    
    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    clearFilters,
    clearError,
    initialize
  }
})