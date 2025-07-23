import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  Priority,
  Tag,
  TasksApiResponse,
  PaginatedResponse,
  TaskStatus
} from '@/types/task'

class TaskService {
  private api: AxiosInstance

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    
    this.api = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    this.setupInterceptors()
    console.log('🔧 TaskService initialized with:', baseURL)
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
        if (config.params) {
          console.log('📦 Query params:', config.params)
        }
        if (config.data) {
          console.log('📦 Request body:', config.data)
        }
        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('❌ API Error:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Serializar parámetros SOLO para query strings (filtros)
   */
  private safeQueryParams(params: any): Record<string, string | number | boolean> {
    const result: Record<string, string | number | boolean> = {}
    
    if (!params || typeof params !== 'object') {
      return result
    }

    console.log('🔍 Input params:', params)

    try {
      // Procesar cada parámetro directamente sin JSON stringify/parse
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === '') {
          continue
        }

        // Casos específicos para query params
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          result[key] = value
        } 
        else if (Array.isArray(value)) {
          // Arrays: convertir a string separado por comas
          if (value.length > 0) {
            result[key] = value.join(',')
          }
        } 
        else if (value && typeof value === 'object') {
          // Objetos: extraer valor útil
          if (value.hasOwnProperty('id') && value.id) {
            result[key] = value.id
          } else if (value.hasOwnProperty('value') && value.value) {
            result[key] = value.value
          } else if (value.hasOwnProperty('name') && value.name) {
            result[key] = value.name
          } else {
            // Fallback: convertir a string
            const stringValue = String(value)
            if (stringValue !== '[object Object]') {
              result[key] = stringValue
            }
          }
        }
      }
      
      console.log('🧹 Safe query params result:', result)
      return result
      
    } catch (error) {
      console.error('💥 Error processing query params:', error)
      console.error('💥 Original params:', params)
      return {}
    }
  }

  /**
   * Limpiar datos para envío en el body (crear/actualizar)
   */
  private cleanBodyData(data: any): Record<string, any> {
    const result: Record<string, any> = {}
    
    if (!data || typeof data !== 'object') {
      return result
    }

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== '') {
        // Para el body, mantener arrays como arrays
        if (Array.isArray(value)) {
          if (value.length > 0) {
            result[key] = value
          }
        } else {
          result[key] = value
        }
      }
    }
    
    console.log('🧹 Clean body data:', result)
    return result
  }

  /**
   * Obtener tareas con la nueva estructura de respuesta
   */
  async getTasks(filters: TaskFilters = {}): Promise<TasksApiResponse> {
    try {
      // Para GET /tasks, usar safeQueryParams
      const queryParams = this.safeQueryParams(filters)
      
      const response: AxiosResponse<TasksApiResponse> = await this.api.get('/tasks', { 
        params: queryParams 
      })
      
      return response.data
      
    } catch (error) {
      console.error('💥 getTasks failed:', error)
      throw error
    }
  }

  /**
   * Obtener una tarea específica
   */
  async getTask(id: number): Promise<Task> {
    try {
      const response: AxiosResponse = await this.api.get(`/tasks/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('💥 getTask failed:', error)
      throw error
    }
  }

  /**
   * Crear nueva tarea
   */
  async createTask(data: CreateTaskDto): Promise<Task> {
    try {
      // Para POST /tasks, usar cleanBodyData (mantiene arrays)
      const cleanData = this.cleanBodyData(data)
      const response: AxiosResponse = await this.api.post('/tasks', cleanData)
      return response.data.data || response.data
    } catch (error) {
      console.error('💥 createTask failed:', error)
      throw error
    }
  }

  /**
   * Actualizar tarea existente
   */
  async updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
    try {
      const cleanData = this.cleanBodyData(data)
      const response: AxiosResponse = await this.api.patch(`/tasks/${id}`, cleanData)
      return response.data.data || response.data
    } catch (error) {
      console.error('💥 updateTask failed:', error)
      throw error
    }
  }

  /**
   * Eliminar tarea
   */
  async deleteTask(id: number): Promise<void> {
    try {
      await this.api.delete(`/tasks/${id}`)
    } catch (error) {
      console.error('💥 deleteTask failed:', error)
      throw error
    }
  }

  /**
   * Actualizar estado de tarea
   */
  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    try {
      const response: AxiosResponse = await this.api.patch(`/tasks/${id}/status`, { status })
      console.log(response)
      return response.data.data || response.data
    } catch (error) {
      console.error('💥 updateTaskStatus failed:', error)
      throw error
    }
  }

  /**
   * Búsqueda de tareas
   */
  async searchTasks(query: string): Promise<Task[]> {
    try {
      const response: AxiosResponse = await this.api.get('/tasks/search', { 
        params: { q: query } 
      })
      return response.data.data || response.data || []
    } catch (error) {
      console.error('💥 searchTasks failed:', error)
      throw error
    }
  }

  /**
   * Actualización masiva de tareas
   */
  async bulkUpdateTasks(taskIds: number[], updateData: Partial<UpdateTaskDto>): Promise<Task[]> {
    try {
      const cleanData = this.cleanBodyData({
        task_ids: taskIds,
        ...updateData
      })
      
      const response: AxiosResponse = await this.api.patch('/tasks/bulk', cleanData)
      return response.data.data || response.data || []
    } catch (error) {
      console.error('💥 bulkUpdateTasks failed:', error)
      throw error
    }
  }

  /**
   * Eliminación masiva de tareas
   */
  async bulkDeleteTasks(taskIds: number[]): Promise<void> {
    try {
      await this.api.delete('/tasks/bulk', {
        data: { task_ids: taskIds }
      })
    } catch (error) {
      console.error('💥 bulkDeleteTasks failed:', error)
      throw error
    }
  }

  /**
   * Obtener prioridades disponibles
   */
  async getPriorities(): Promise<Priority[]> {
    try {
      const response: AxiosResponse = await this.api.get('/priorities')
      return response.data.data || response.data || []
    } catch (error) {
      console.error('💥 getPriorities failed:', error)
      return []
    }
  }

  /**
   * Obtener tags disponibles
   */
  async getTags(): Promise<Tag[]> {
    try {
      const response: AxiosResponse = await this.api.get('/tags')
      return response.data.data || response.data || []
    } catch (error) {
      console.error('💥 getTags failed:', error)
      return []
    }
  }

  /**
   * Health check
   */
  public healthCheck(): Promise<boolean> {
    return this.testConnection()
  }

  /**
   * Test de conectividad
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/health')
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Obtener configuración actual
   */
  getConfig() {
    return {
      baseURL: this.api.defaults.baseURL,
      timeout: this.api.defaults.timeout
    }
  }
}

// Helper functions SEGURAS para trabajar con la nueva estructura
export const taskHelpers = {
  // Status helpers con validación
  getStatusValue: (task: Task): string => {
    if (typeof task.status === 'string') return task.status
    return task.status?.value || 'pending'
  },
  
  getStatusLabel: (task: Task): string => {
    if (typeof task.status === 'string') return task.status
    return task.status?.label || task.status?.value || 'Pending'
  },
  
  getStatusColor: (task: Task): string | undefined => {
    if (typeof task.status === 'string') return undefined
    return task.status?.color
  },

  // Priority helpers con validación
  getPriorityName: (task: Task): string => {
    if (!task.priority) return 'Normal'
    if (typeof task.priority === 'string') return task.priority
    return task.priority?.name || task.priority?.label || 'Normal'
  },
  
  getPriorityLabel: (task: Task): string => {
    if (!task.priority) return 'Normal'
    if (typeof task.priority === 'string') return task.priority
    return task.priority?.label || task.priority?.name || 'Normal'
  },
  
  getPriorityColor: (task: Task): string | undefined => {
    if (!task.priority || typeof task.priority === 'string') return undefined
    return task.priority?.color
  },

  // Date helpers con validación
  isOverdue: (task: Task): boolean => {
    return task.dates?.is_overdue || false
  },
  
  getDaysUntilDue: (task: Task): number | null => {
    return task.dates?.days_until_due ?? null
  },
  
  getFormattedDueDate: (task: Task): string | null => {
    return task.dates?.formatted_due_date || task.dates?.due_date || null
  },
  
  getCreatedAt: (task: Task): string => {
    return task.dates?.created_at || task.created_at || ''
  },
  
  getUpdatedAt: (task: Task): string => {
    return task.dates?.updated_at || task.updated_at || ''
  },

  // Meta helpers con validación
  canEdit: (task: Task): boolean => {
    return task.meta?.can_edit !== false // Por defecto true
  },
  
  getUrgencyLevel: (task: Task): string => {
    return task.meta?.urgency_level || 'normal'
  },

  // Helper para validar estructura de tarea
  isValidTask: (task: any): task is Task => {
    return task && 
           typeof task === 'object' && 
           typeof task.id !== 'undefined' && 
           typeof task.title === 'string'
  },

  // Helper para normalizar status
  normalizeStatus: (status: any): { value: string; label: string; color?: string } => {
    if (typeof status === 'string') {
      return {
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
      }
    }
    
    if (status && typeof status === 'object') {
      return {
        value: status.value || 'pending',
        label: status.label || status.value || 'Pending',
        color: status.color
      }
    }
    
    return { value: 'pending', label: 'Pending' }
  },

  // Helper para normalizar priority
  normalizePriority: (priority: any): { id: number; name: string; label: string; color?: string } | null => {
    if (!priority) return null
    
    if (typeof priority === 'string') {
      return {
        id: 0,
        name: priority,
        label: priority
      }
    }
    
    if (priority && typeof priority === 'object') {
      return {
        id: priority.id || 0,
        name: priority.name || priority.label || 'Normal',
        label: priority.label || priority.name || 'Normal',
        color: priority.color
      }
    }
    
    return null
  }
}

export const taskService = new TaskService()
export default taskService