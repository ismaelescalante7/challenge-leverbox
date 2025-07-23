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
  PaginatedResponse
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

    try {
      const jsonString = JSON.stringify(params, (key, value) => {
        if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
          return undefined
        }
        
        // Para query params, convertir arrays a strings
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(',') : undefined
        }
        
        if (value && typeof value === 'object' && value.constructor === Object) {
          return value.id || value.value || String(value)
        }
        
        return value
      })
      
      const parsed = JSON.parse(jsonString)
      
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            result[key] = value
          }
        }
      }
      
      console.log('🧹 Safe query params:', result)
      return result
      
    } catch (error) {
      console.error('💥 Error serializing query params:', error)
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
      // Para PUT /tasks/{id}, usar cleanBodyData (mantiene arrays)
      const cleanData = this.cleanBodyData(data)
      const response: AxiosResponse = await this.api.put(`/tasks/${id}`, cleanData)
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
  async updateTaskStatus(id: number, status: string): Promise<Task> {
    try {
      const response: AxiosResponse = await this.api.patch(`/tasks/${id}/status`, { status })
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

// Helper functions para trabajar con la nueva estructura
export const taskHelpers = {
  getStatusValue: (task: Task) => task.status.value,
  getStatusLabel: (task: Task) => task.status.label,
  getStatusColor: (task: Task) => task.status.color,
  getPriorityName: (task: Task) => task.priority.name,
  getPriorityLabel: (task: Task) => task.priority.label,
  getPriorityColor: (task: Task) => task.priority.color,
  isOverdue: (task: Task) => task.dates.is_overdue,
  canEdit: (task: Task) => task.meta.can_edit,
  getDaysUntilDue: (task: Task) => task.dates.days_until_due,
  getFormattedDueDate: (task: Task) => task.dates.formatted_due_date,
  getCreatedAt: (task: Task) => task.dates.created_at,
  getUpdatedAt: (task: Task) => task.dates.updated_at,
  getUrgencyLevel: (task: Task) => task.meta.urgency_level
}

export const taskService = new TaskService()
export default taskService