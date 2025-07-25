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
  AvailableFilters,
  TaskStatus
} from '@/types/task'

// Types para manejo de errores

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

  // 🔍 ERROR HANDLING HELPER CON MEJOR DEBUG
  const parseError = (err: any): StoreError => {
    
    // Si es un AxiosError con respuesta del servidor
    if (err?.isAxiosError && err.response) {
      const response = err.response
      const data: ApiErrorResponse = response.data || {}
      
      // Error de validación (422)
      if (response.status === 422 || data.validation_failed || data.error_type === 'validation') {
        const parsed = {
          message: data.message || 'Validation failed',
          type: 'validation' as const,
          validationErrors: data.errors || {},
          statusCode: response.status
        }
        
        return parsed
      }
      
      // Error del servidor (500)
      if (response.status >= 500) {
        const parsed = {
          message: data.message || 'Server error occurred',
          type: 'server' as const,
          statusCode: response.status
        }
        
        return parsed
      }
      
      // Otros errores del servidor (400, 401, 403, 404, etc.)
      const parsed = {
        message: data.message || `Server error (${response.status})`,
        type: 'server' as const,
        statusCode: response.status
      }
      
      return parsed
    }
    
    // Error de red (sin respuesta del servidor)
    if (err?.isAxiosError && err.code === 'ECONNABORTED') {
      const parsed = {
        message: 'Request timeout - please try again',
        type: 'network' as const
      }
      
      return parsed
    }
    
    if (err?.isAxiosError && !err.response) {
      const parsed = {
        message: 'Network error - please check your connection',
        type: 'network' as const
      }
      
      return parsed
    }
    
    // Error genérico
    const parsed = {
      message: err?.message || 'An unexpected error occurred',
      type: 'unknown' as const
    }
    
    return parsed
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
      const cleanFilters: Record<string, any> = {
        // Paginación y orden
        page: page || filters.value.page || 1,
        per_page: filters.value.per_page || 10,
        sort_by: filters.value.sort_by || 'created_at',
        sort_direction: filters.value.sort_direction || 'desc'
      }
      
      if (filters.value.search && filters.value.search.trim()) {
        cleanFilters.search = filters.value.search.trim()
      }
      
      if (filters.value.status && filters.value.status !== '') {
        cleanFilters.status = filters.value.status
      }
      
      if (filters.value.priority_id && filters.value.priority_id !== '') {
        cleanFilters.priority_id = filters.value.priority_id
      }
      
      if (filters.value.tag_ids && Array.isArray(filters.value.tag_ids) && filters.value.tag_ids.length > 0) {
        cleanFilters.tag_ids = [...filters.value.tag_ids]
      }
      
      if (filters.value.overdue === true) {
        cleanFilters.overdue = true
      }
      
      const response: TasksApiResponse = await taskService.getTasks(cleanFilters)
      
      // Actualizar state con nueva estructura
      tasks.value = response.data || []
      pagination.value = response.pagination || pagination.value
      availableFilters.value = response.filters || null
    } catch (err: any) {
      console.error('💥 Store fetchTasks failed:', err)
      error.value = parseError(err)
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
      console.error('💥 Store fetchTask failed:', err)
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
      console.error('💥 Store updateTaskStatus failed:', err)
      error.value = parseError(err)
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
      console.error('💥 Store fetchPriorities failed:', err)
      // No lanzar error para no bloquear la app si priorities fallan
      priorities.value = []
    } finally {
      loadingPriorities.value = false
    }
  }

  // Actions para Tags
  const fetchTags = async (): Promise<void> => {
    console.log('🔍 Store fetchTags called')
    loadingTags.value = true
    
    try {
      const data = await taskService.getTags()
      tags.value = data
    } catch (err: any) {
      console.error('💥 Store fetchTags failed:', err)
      // No lanzar error para no bloquear la app si tags fallan
      tags.value = []
    } finally {
      loadingTags.value = false
    }
  }

  // 🎯 CRUD Operations CON MEJOR DEBUG
  const createTask = async (data: CreateTaskDto): Promise<void> => {
    console.log('🔍 Store createTask called with data:', data)
    loading.value = true
    error.value = null
    
    try {
      const newTask = await taskService.createTask(data)
      
      tasks.value.unshift(newTask)
      
      // Limpiar errores después de éxito
      error.value = null
    } catch (err: any) {
      console.error('💥 Store createTask failed - Raw error:', err)
      const parsedError = parseError(err)
      error.value = parsedError
      
      console.error('💥 Store createTask - Parsed error:', parsedError)
      console.error('💥 Store createTask - Validation errors:', parsedError.validationErrors)
      
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
      console.error('💥 Store updateTask failed:', err)
      const parsedError = parseError(err)
      error.value = parsedError
      
      console.error('💥 Store updateTask - Parsed error:', parsedError)
      
      throw parsedError
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: number): Promise<void> => {
    console.log('🔍 Store deleteTask called with id:', id)
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
      console.error('💥 Store deleteTask failed:', err)
      const parsedError = parseError(err)
      error.value = parsedError
      
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
    console.log('🔍 Store refreshPriorities called')
    await fetchPriorities()
  }

  const refreshTags = async (): Promise<void> => {
    console.log('🔍 Store refreshTags called')
    await fetchTags()
  }

  const refreshAll = async (): Promise<void> => {
    console.log('🔍 Store refreshAll called')
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
    console.log('🔍 Store initialize called')
    console.log('🔍 Store initialize - Already initialized?', initialized.value)
    
    if (initialized.value) {
      console.log('🔍 Store initialize - Already initialized, skipping')
      return
    }
    
    try {
      console.log('🔍 Store initialize - Starting parallel fetch...')
      
      // Cargar todo en paralelo para mejor performance
      await Promise.all([
        fetchTasks(),
        fetchPriorities(),
        fetchTags()
      ])
      
      initialized.value = true
      console.log('🔍 Store initialize - Successfully initialized!')
      console.log('🔍 Store initialize - Final state:', {
        tasks: tasks.value.length,
        priorities: priorities.value.length,
        tags: tags.value.length,
        error: error.value
      })
      
    } catch (err: any) {
      console.error('💥 Store initialize failed:', err)
      const parsedError = parseError(err)
      error.value = parsedError
      
      console.error('💥 Store initialize - Parsed error:', parsedError)
      throw parsedError
    }
  }

  // Force re-initialize
  const reinitialize = async (): Promise<void> => {
    console.log('🔍 Store reinitialize called')
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