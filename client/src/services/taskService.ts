import axios from '@/plugins/axios' // ✅ Usar el plugin configurado
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
    // ✅ Usar la instancia de axios ya configurada del plugin
    this.api = axios
    
    // ✅ Solo agregar interceptors específicos para debugging si es necesario
    this.setupDebugInterceptors()
  }

  private setupDebugInterceptors(): void {
    // ✅ Solo interceptors de debug, no reconfigurar auth
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 TaskService ${config.method?.toUpperCase()} ${config.url}`)
        if (config.params) {
          console.log('📦 Query params:', config.params)
        }
        if (config.data) {
          console.log('📦 Request body:', config.data)
        }
        return config
      },
      (error) => {
        console.error('❌ TaskService Request Error:', error)
        return Promise.reject(error)
      }
    )

    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ TaskService ${response.status} ${response.config.url}`)
        console.log('📦 Response data:', response.data)
        return response
      },
      (error) => {
        console.error('❌ TaskService API Error:', error)
        console.error('❌ Error response:', error.response?.data)
        console.error('❌ Error status:', error.response?.status)
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
      
      const response: AxiosResponse<TasksApiResponse> = await this.api.get('api/tasks', { 
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
      const response: AxiosResponse = await this.api.get(`api/tasks/${id}`)
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
      console.log('🔍 createTask called with:', data)
      
      // Para POST /tasks, usar cleanBodyData (mantiene arrays)
      const cleanData = this.cleanBodyData(data)
      console.log('🔍 Sending clean data:', cleanData)
      
      const response: AxiosResponse = await this.api.post('api/tasks', cleanData)
      console.log('🔍 createTask response:', response.data)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('💥 createTask failed:', error)
      console.error('💥 Original data:', data)
      
      // 🔍 DEBUG: Log error details for debugging
      if (error.response) {
        console.error('💥 Error status:', error.response.status)
        console.error('💥 Error data:', error.response.data)
        console.error('💥 Error headers:', error.response.headers)
      }
      
      throw error
    }
  }

  /**
   * Actualizar tarea existente
   */
  async updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
    try {
      console.log('🔍 updateTask called with:', { id, data })
      
      const cleanData = this.cleanBodyData(data)
      console.log('🔍 Sending clean data:', cleanData)
      
      const response: AxiosResponse = await this.api.patch(`api/tasks/${id}`, cleanData)
      console.log('🔍 updateTask response:', response.data)
      
      return response.data.data || response.data
    } catch (error) {
      console.error('💥 updateTask failed:', error)
      console.error('💥 Task ID:', id)
      console.error('💥 Original data:', data)
      throw error
    }
  }

  /**
   * Eliminar tarea
   */
  async deleteTask(id: number): Promise<void> {
    try {
      await this.api.delete(`api/tasks/${id}`)
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
      const response: AxiosResponse = await this.api.patch(`api/tasks/${id}/status`, { status })
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
      const response: AxiosResponse = await this.api.get('api/tasks/search', { 
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
      
      const response: AxiosResponse = await this.api.patch('api/tasks/bulk', cleanData)
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
      const response: AxiosResponse = await this.api.get('api/priorities')
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
      const response: AxiosResponse = await this.api.get('api/tags')
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
      await this.api.get('api/health')
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

// 🔧 Helper functions ACTUALIZADOS para la estructura real del API
export const taskHelpers = {
  // Status helpers - CORREGIDOS para StatusObject
  getStatusValue: (task: Task): string => {
    console.log('🔍 taskHelper getStatusValue - task.status:', task.status)
    
    // Si es un objeto StatusObject
    if (task.status && typeof task.status === 'object' && 'value' in task.status) {
      console.log('🔍 taskHelper getStatusValue - returning object value:', task.status.value)
      return task.status.value
    }
    
    // Si es un string directo (fallback)
    if (typeof task.status === 'string') {
      console.log('🔍 taskHelper getStatusValue - returning string:', task.status)
      return task.status
    }
    
    // Default
    console.log('🔍 taskHelper getStatusValue - returning default: pending')
    return 'pending'
  },
  
  getStatusLabel: (task: Task): string => {
    // Si es un objeto StatusObject
    if (task.status && typeof task.status === 'object' && 'label' in task.status) {
      return task.status.label
    }
    
    // Si es un string, formatear
    if (typeof task.status === 'string') {
      return task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')
    }
    
    return 'Pending'
  },

  getStatusColor: (task: Task): string | undefined => {
    // Si es un objeto StatusObject con color
    if (task.status && typeof task.status === 'object' && 'color' in task.status) {
      return task.status.color
    }
    
    return undefined
  },

  // Priority helpers - CORREGIDOS para Priority object
  getPriorityName: (task: Task): string => {
    if (!task.priority) return 'Normal'
    
    // Si es un objeto Priority
    if (typeof task.priority === 'object' && 'name' in task.priority) {
      return task.priority.name || task.priority.label || 'Normal'
    }
    
    // Si es un string (fallback)
    if (typeof task.priority === 'string') {
      return task.priority
    }
    
    return 'Normal'
  },
  
  getPriorityLabel: (task: Task): string => {
    if (!task.priority) return 'Normal'
    
    // Si es un objeto Priority
    if (typeof task.priority === 'object' && 'label' in task.priority) {
      return task.priority.label || task.priority.name || 'Normal'
    }
    
    // Si es un string (fallback)
    if (typeof task.priority === 'string') {
      return task.priority
    }
    
    return 'Normal'
  },
  
  getPriorityColor: (task: Task): string | undefined => {
    if (!task.priority || typeof task.priority !== 'object') return undefined
    return task.priority.color
  },

  // Date helpers - CORREGIDOS para TaskDates object
  isOverdue: (task: Task): boolean => {
    console.log('🔍 taskHelper isOverdue - task.dates:', task.dates)
    
    // Si tiene estructura dates con is_overdue
    if (task.dates && typeof task.dates === 'object' && 'is_overdue' in task.dates) {
      console.log('🔍 taskHelper isOverdue - using dates.is_overdue:', task.dates.is_overdue)
      return task.dates.is_overdue || false
    }
    
    // Fallback: calcular manualmente si tiene due_date
    if (task.dates?.due_date) {
      const isOverdue = new Date(task.dates.due_date) < new Date()
      console.log('🔍 taskHelper isOverdue - calculated:', isOverdue)
      return isOverdue
    }
    
    console.log('🔍 taskHelper isOverdue - no due date, returning false')
    return false
  },
  
  getDaysUntilDue: (task: Task): number | null => {
    if (task.dates && 'days_until_due' in task.dates) {
      return task.dates.days_until_due
    }
    return null
  },
  
  getFormattedDueDate: (task: Task): string | null => {
    if (task.dates?.formatted_due_date) {
      return task.dates.formatted_due_date
    }
    if (task.dates?.due_date) {
      return task.dates.due_date
    }
    return null
  },
  
  getCreatedAt: (task: Task): string => {
    return task.dates?.created_at || ''
  },
  
  getUpdatedAt: (task: Task): string => {
    return task.dates?.updated_at || ''
  },

  // Meta helpers - CORREGIDOS para TaskMeta object
  canEdit: (task: Task): boolean => {
    if (task.meta && 'can_edit' in task.meta) {
      return task.meta.can_edit !== false
    }
    return true // Por defecto se puede editar
  },
  
  getUrgencyLevel: (task: Task): string => {
    if (task.meta && 'urgency_level' in task.meta) {
      return task.meta.urgency_level
    }
    return 'normal'
  },

  // Helper para validar estructura de tarea
  isValidTask: (task: any): task is Task => {
    return task && 
           typeof task === 'object' && 
           typeof task.id !== 'undefined' && 
           typeof task.title === 'string'
  }
}

export const taskService = new TaskService()
export default taskService