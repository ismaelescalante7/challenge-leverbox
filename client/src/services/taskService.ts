
import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  Priority,
  Tag,
  ApiResponse,
  PaginatedResponse
} from '@/types/task'

class TaskService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://0.0.0.0:8000/api',
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
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        }
        return response
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // ==========================================
  // TASK CRUD OPERATIONS (Solo los que necesitas)
  // ==========================================

  /**
   * Get paginated list of tasks with optional filters
   */
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const params = this.cleanParams(filters)
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Task>>> = await this.api.get('/tasks', { params })
    return response.data.data
  }

  /**
   * Get single task by ID
   */
  async getTask(id: number): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.get(`/tasks/${id}`)
    return response.data.data
  }

  /**
   * Create new task
   */
  async createTask(data: CreateTaskDto): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.post('/tasks', data)
    return response.data.data
  }

  /**
   * Update existing task
   */
  async updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.put(`/tasks/${id}`, data)
    return response.data.data
  }

  /**
   * Delete task
   */
  async deleteTask(id: number): Promise<void> {
    await this.api.delete(`/tasks/${id}`)
  }

  // ==========================================
  // RELATED DATA (Si las necesitas)
  // ==========================================

  /**
   * Get all priorities
   */
  async getPriorities(): Promise<Priority[]> {
    const response: AxiosResponse<ApiResponse<Priority[]>> = await this.api.get('/priorities')
    return response.data.data
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<Tag[]> {
    const response: AxiosResponse<ApiResponse<Tag[]>> = await this.api.get('/tags')
    return response.data.data
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Clean undefined/empty parameters
   */
  private cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    
    Object.keys(params).forEach(key => {
      const value = params[key]
      
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value
      }
    })
    
    return cleaned
  }
}

// Export singleton instance
export const taskService = new TaskService()
export default taskService