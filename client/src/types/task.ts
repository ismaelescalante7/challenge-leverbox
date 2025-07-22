
// Tipos base
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Priority {
  id: number
  name: string
  level: number
  color?: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  color?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority_id: number | null
  priority?: Priority
  due_date: string | null
  completed_at: string | null
  is_overdue: boolean
  tags: Tag[]
  created_at: string
  updated_at: string
}

// DTOs para crear/actualizar tareas
export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus
  priority_id?: number
  due_date?: string
  tag_ids?: number[]
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
  priority_id?: number
  due_date?: string
  tag_ids?: number[]
}

// Filtros básicos
export interface TaskFilters {
  status?: TaskStatus | ''
  priority_id?: number | ''
  search?: string
  page?: number
  per_page?: number
}

// Respuestas de la API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

// Estados del store
export interface TasksState {
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  error: string | null
  priorities: Priority[]
  tags: Tag[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  filters: TaskFilters
}