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
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.api.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        console.error('❌ API Error:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Serializar parámetros de forma segura
   */
  private safeParams(params: any): Record<string, string | number | boolean> {
    const result: Record<string, string | number | boolean> = {}
    
    if (!params || typeof params !== 'object') {
      return result
    }

    try {
      const jsonString = JSON.stringify(params, (key, value) => {
        if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
          return undefined
        }
        
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
      
      return result
      
    } catch (error) {
      console.error('💥 Error serializing params:', error)
      return {}
    }
  }

  /**
   * Obtener tareas con la nueva estructura de respuesta
   */
  async getTasks(filters: TaskFilters = {}): Promise<TasksApiResponse> {
    try {
      const safeParams = this.safeParams(filters)
      
      const response: AxiosResponse<TasksApiResponse> = await this.api.get('/tasks', { 
        params: safeParams 
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
      const safeData = this.safeParams(data)
      const response: AxiosResponse = await this.api.post('/tasks', safeData)
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
      const safeData = this.safeParams(data)
      const response: AxiosResponse = await this.api.put(`/tasks/${id}`, safeData)
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
   * 
   * Check connection
   */
  public healthCheck() {
    return this.testConnection();
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