import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  Priority,
  Tag,
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
    console.log('🔧 TaskService (TS) initialized with:', baseURL)
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
        console.log('📦 Sending params:', config.params)
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
        console.log('📦 Response:', response.data)
        return response
      },
      (error) => {
        console.error('❌ API Error:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * SOLUCIÓN DEFINITIVA: Serializar parámetros de forma súper segura
   */
  private ultraSafeParams(params: any): Record<string, string | number | boolean> {
    const result: Record<string, string | number | boolean> = {}
    
    if (!params || typeof params !== 'object') {
      return result
    }

    try {
      // Convertir a JSON y volver a parsear para eliminar proxies/referencias
      const jsonString = JSON.stringify(params, (key, value) => {
        // Eliminar funciones, símbolos, undefined
        if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
          return undefined
        }
        
        // Convertir arrays a strings simples
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(',') : undefined
        }
        
        // Convertir objetos complejos a valores primitivos
        if (value && typeof value === 'object' && value.constructor === Object) {
          return value.id || value.value || String(value)
        }
        
        return value
      })
      
      const parsed = JSON.parse(jsonString)
      
      // Solo incluir valores válidos
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            result[key] = value
          }
        }
      }
      
      console.log('🛡️ Ultra-safe params:', result)
      return result
      
    } catch (error) {
      console.error('💥 Error serializing params:', error)
      return {}
    }
  }

  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    try {
      const safeParams = this.ultraSafeParams(filters)
      
      const response: AxiosResponse = await this.api.get('/tasks', { 
        params: safeParams 
      })
      
      const data = response.data
      
      if (data.data && Array.isArray(data.data)) {
        return data
      } else if (Array.isArray(data)) {
        return {
          data,
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: data.length,
          to: data.length,
          total: data.length
        }
      }
      
      return data
    } catch (error) {
      console.error('💥 getTasks failed:', error)
      throw error
    }
  }

  async getTask(id: number): Promise<Task> {
    const response: AxiosResponse = await this.api.get(`/tasks/${id}`)
    return response.data.data || response.data
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    const safeData = this.ultraSafeParams(data)
    const response: AxiosResponse = await this.api.post('/tasks', safeData)
    return response.data.data || response.data
  }

  async updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
    const safeData = this.ultraSafeParams(data)
    const response: AxiosResponse = await this.api.put(`/tasks/${id}`, safeData)
    return response.data.data || response.data
  }

  async deleteTask(id: number): Promise<void> {
    await this.api.delete(`/tasks/${id}`)
  }

  async getPriorities(): Promise<Priority[]> {
    try {
      const response: AxiosResponse = await this.api.get('/priorities')
      return response.data.data || response.data || []
    } catch (error) {
      return []
    }
  }

  async getTags(): Promise<Tag[]> {
    try {
      const response: AxiosResponse = await this.api.get('/tags')
      return response.data.data || response.data || []
    } catch (error) {
      return []
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/health')
      return true
    } catch (error) {
      return false
    }
  }

  getConfig() {
    return {
      baseURL: this.api.defaults.baseURL,
      timeout: this.api.defaults.timeout
    }
  }
}

export const taskService = new TaskService()
export default taskService