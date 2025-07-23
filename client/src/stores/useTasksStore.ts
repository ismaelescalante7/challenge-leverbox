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

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const priorities = ref<Priority[]>([])
  const tags = ref<Tag[]>([])
  
  // Loading states para resources individuales
  const loadingPriorities = ref(false)
  const loadingTags = ref(false)
  const initialized = ref(false)
  
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

  // Computed para estado general de loading
  const isLoading = computed(() => 
    loading.value || loadingPriorities.value || loadingTags.value
  )

  // Actions para Tasks
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
      console.log('📥 Store: Fetching task ID:', id)
      const task = await taskService.getTask(id)
      currentTask.value = task
      console.log('✅ Store: Task fetched successfully:', task.id)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task'
      console.error('💥 Store: Fetch task failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update task status specifically
  const updateTaskStatus = async (id: number, status: TaskStatus): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      console.log('📥 Store: Updating task status ID:', id, 'to:', status)
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
      
      console.log('✅ Store: Task status updated successfully')
    } catch (err: any) {
      error.value = err.message || 'Failed to update task status'
      console.error('💥 Store: Update status failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions para Priorities
  const fetchPriorities = async (): Promise<void> => {
    console.log('📥 Store: Fetching priorities...')
    loadingPriorities.value = true
    
    try {
      const data = await taskService.getPriorities()
      priorities.value = data
      console.log('🎯 Priorities loaded:', priorities.value.length)
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
    console.log('📥 Store: Fetching tags...')
    loadingTags.value = true
    
    try {
      const data = await taskService.getTags()
      tags.value = data
      console.log('🏷️  Tags loaded:', tags.value.length)
    } catch (err: any) {
      console.error('💥 Failed to fetch tags:', err)
      // No lanzar error para no bloquear la app si tags fallan
      tags.value = []
    } finally {
      loadingTags.value = false
    }
  }

  // CRUD Operations
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
      console.log('📋 Store already initialized, skipping...')
      return
    }

    console.log('🚀 Initializing TasksStore...')
    
    try {
      // Cargar todo en paralelo para mejor performance
      await Promise.all([
        fetchTasks(),
        fetchPriorities(),
        fetchTags()
      ])
      
      initialized.value = true
      console.log('✅ TasksStore initialized successfully!')
      console.log(`📊 Loaded: ${tasks.value.length} tasks, ${priorities.value.length} priorities, ${tags.value.length} tags`)
      
    } catch (err: any) {
      console.error('💥 Failed to initialize TasksStore:', err)
      error.value = 'Failed to initialize application data'
      throw err
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
    
    // Helper Methods
    getPriorityById,
    getTagById,
    getTagsByIds,
    
    // Initialization
    initialize,
    reinitialize
  }
})