import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService, taskHelpers } from '@/services/taskService'
import type { AxiosError } from 'axios'
import type { 
  Task, 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskFilters, 
  Priority, 
  Tag, 
  TasksApiResponse,
  PaginationInfo,
  AvailableFilters,
  TaskStatus
} from '@/types/task'

// Types para manejo de errores
interface ValidationError {
  message: string
  errors: Record<string, string[]>
}

interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  error_type?: string
  validation_failed?: boolean
  http_status?: number
}

interface StoreError {
  message: string
  type: 'validation' | 'network' | 'server' | 'unknown'
  validationErrors?: Record<string, string[]>
  statusCode?: number
}

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<StoreError | null>(null)
  const priorities = ref<Priority[]>([])
  const tags = ref<Tag[]>([])
  
  // Loading states para resources individuales
  const loadingPriorities = ref(false)
  const loadingTags = ref(false)
  const initialized = ref(false)
  
  // Pagination
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

  // Error handling helper
  const parseError = (err: any): StoreError => {
    console.log('🔍 Parsing error:', err)
    
    // Si es un AxiosError con respuesta del servidor
    if (err.isAxiosError && err.response) {
      const response = err.response
      const data: ApiErrorResponse = response.data || {}
      
      // Error de validación (422)
      if (response.status === 422 || data.validation_failed || data.error_type === 'validation') {
        return {
          message: data.message || 'Validation failed',
          type: 'validation',
          validationErrors: data.errors || {},
          statusCode: response.status
        }
      }
      
      // Error del servidor (500)
      if (response.status >= 500) {
        return {
          message: data.message || 'Server error occurred',
          type: 'server',
          statusCode: response.status
        }
      }
      
      // Otros errores del servidor (400, 401, 403, 404, etc.)
      return {
        message: data.message || `Server error (${response.status})`,
        type: 'server',
        statusCode: response.status
      }
    }
    
    // Error de red (sin respuesta del servidor)
    if (err.isAxiosError && err.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout - please try again',
        type: 'network'
      }
    }
    
    if (err.isAxiosError && !err.response) {
      return {
        message: 'Network error - please check your connection',
        type: 'network'
      }
    }
    
    // Error genérico
    return {
      message: err.message || 'An unexpected error occurred',
      type: 'unknown'
    }
  }

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

  // Computed para estado general de loading
  const isLoading = computed(() => 
    loading.value || loadingPriorities.value || loadingTags.value
  )

  // Computed para verificar si hay errores de validación
  const hasValidationErrors = computed(() => 
    error.value?.type === 'validation' && !!error.value.validationErrors
  )

  // Actions para Tasks
  const fetchTasks = async (page?: number): Promise<void> => {
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

      if (Array.isArray(filters.value.tag_ids) && filters.value.tag_ids.length > 0) {
        cleanFilters.tag_ids = [...filters.value.tag_ids]
      }
      
      const response: TasksApiResponse = await taskService.getTasks(cleanFilters)
      
      // Actualizar state con nueva estructura
      tasks.value = response.data
      pagination.value = response.pagination
      availableFilters.value = response.filters
      
    } catch (err: any) {
      error.value = parseError(err)
      console.error('💥 Store fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTask = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const task = await taskService.getTask(id)
      currentTask.value = task
    } catch (err: any) {
      error.value = parseError(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update task status specifically
  const updateTaskStatus = async (id: number, status: TaskStatus): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const updatedTask = await taskService.updateTaskStatus(id, status)
      
      // Actualizar en la lista
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      
      // Actualizar tarea actual si coincide
      if (currentTask.value?.id === id) {
        currentTask.value = updatedTask
      }
      
    } catch (err: any) {
      error.value = parseError(err)
      console.error('💥 Store: Update status failed:', err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Actions para Priorities
  const fetchPriorities = async (): Promise<void> => {
    loadingPriorities.value = true
    
    try {
      const data = await taskService.getPriorities()
      priorities.value = data
    } catch (err: any) {
      console.error('💥 Failed to fetch priorities:', err)
      // No lanzar error para no bloquear la app si priorities fallan
      priorities.value = []
    } finally {
      loadingPriorities.value = false
    }
  }

  // Actions para Tags
  const fetchTags = async (): Promise<void> => {
    loadingTags.value = true
    
    try {
      const data = await taskService.getTags()
      tags.value = data
    } catch (err: any) {
      console.error('💥 Failed to fetch tags:', err)
      // No lanzar error para no bloquear la app si tags fallan
      tags.value = []
    } finally {
      loadingTags.value = false
    }
  }

  // CRUD Operations con mejor manejo de errores
  const createTask = async (data: CreateTaskDto): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const newTask = await taskService.createTask(data)
      tasks.value.unshift(newTask)
      
      // Limpiar errores después de éxito
      error.value = null
      
    } catch (err: any) {
      const parsedError = parseError(err)
      error.value = parsedError
      
      console.error('💥 Store: Create task failed:', {
        originalError: err,
        parsedError,
        validationErrors: parsedError.validationErrors
      })
      
      throw parsedError
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
      
      // Limpiar errores después de éxito
      error.value = null
      
    } catch (err: any) {
      const parsedError = parseError(err)
      error.value = parsedError
      
      console.error('💥 Store: Update task failed:', {
        originalError: err,
        parsedError,
        validationErrors: parsedError.validationErrors
      })
      
      throw parsedError
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
      
      // Limpiar errores después de éxito
      error.value = null
      
    } catch (err: any) {
      const parsedError = parseError(err)
      error.value = parsedError
      
      console.error('💥 Store: Delete task failed:', parsedError)
      throw parsedError
    } finally {
      loading.value = false
    }
  }

  // Filter actions
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

  // Método para obtener errores de un campo específico
  const getFieldErrors = (fieldName: string): string[] => {
    if (!error.value?.validationErrors) return []
    return error.value.validationErrors[fieldName] || []
  }

  // Método para verificar si un campo tiene errores
  const hasFieldError = (fieldName: string): boolean => {
    return getFieldErrors(fieldName).length > 0
  }

  // Método para obtener el primer error de un campo
  const getFirstFieldError = (fieldName: string): string | null => {
    const errors = getFieldErrors(fieldName)
    return errors.length > 0 ? errors[0] : null
  }

  // Refresh actions
  const refreshPriorities = async (): Promise<void> => {
    await fetchPriorities()
  }

  const refreshTags = async (): Promise<void> => {
    await fetchTags()
  }

  const refreshAll = async (): Promise<void> => {
    await Promise.all([
      fetchTasks(),
      fetchPriorities(),
      fetchTags()
    ])
  }

  // Helper methods
  const getPriorityById = (id: number): Priority | undefined => {
    return priorities.value.find(p => p.id === id)
  }

  const getTagById = (id: number): Tag | undefined => {
    return tags.value.find(t => t.id === id)
  }

  const getTagsByIds = (ids: number[]): Tag[] => {
    return tags.value.filter(t => ids.includes(t.id))
  }

  // INITIALIZE - Método principal de inicialización
  const initialize = async (): Promise<void> => {
    if (initialized.value) {
      return
    }
    
    try {
      // Cargar todo en paralelo para mejor performance
      await Promise.all([
        fetchTasks(),
        fetchPriorities(),
        fetchTags()
      ])
      
      initialized.value = true
    } catch (err: any) {
      const parsedError = parseError(err)
      error.value = parsedError
      
      console.error('💥 Failed to initialize TasksStore:', parsedError)
      throw parsedError
    }
  }

  // Force re-initialize
  const reinitialize = async (): Promise<void> => {
    initialized.value = false
    await initialize()
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
    loadingPriorities,
    loadingTags,
    initialized,
    
    // Computed
    tasksByStatus,
    overdueTasks,
    editableTasks,
    taskStats,
    isLoading,
    hasValidationErrors,
    
    // Task Actions
    fetchTasks,
    fetchTask,
    updateTaskStatus,
    createTask,
    updateTask,
    deleteTask,
    
    // Resource Actions
    fetchPriorities,
    fetchTags,
    refreshPriorities,
    refreshTags,
    refreshAll,
    
    // Filter Actions
    updateFilters,
    clearFilters,
    clearError,
    
    // Error handling methods
    getFieldErrors,
    hasFieldError,
    getFirstFieldError,
    
    // Helper Methods
    getPriorityById,
    getTagById,
    getTagsByIds,
    
    // Initialization
    initialize,
    reinitialize
  }
})