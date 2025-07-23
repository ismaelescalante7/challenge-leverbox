// Tipos base actualizados según la respuesta real del API
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface StatusObject {
  value: TaskStatus
  label: string
  color: string
}

export interface Priority {
  id: number
  name: string
  label: string
  color: string
}

export interface Tag {
  id: number
  name: string
  label: string
  color: string
}

export interface TaskDates {
  due_date: string | null
  formatted_due_date: string | null
  days_until_due: number
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface TaskMeta {
  can_edit: boolean
  urgency_level: 'low' | 'high'
}

// Interface principal de Task actualizada
export interface Task {
  id: number
  title: string
  description: string | null
  status: StatusObject  // ✅ Ahora es objeto, no string
  dates: TaskDates      // ✅ Fechas agrupadas
  priority: Priority    // ✅ Objeto completo, no solo ID
  tags: Tag[]           // ✅ Array de objetos completos
  meta: TaskMeta        // ✅ Metadatos adicionales
}

// DTOs para crear/actualizar tareas (mantienen formato simple)
export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatus  // String simple para envío
  priority_id?: number
  due_date?: string
  tag_ids?: number[]
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus  // String simple para envío
  priority_id?: number
  due_date?: string
  tag_ids?: number[]
}

// Filtros actualizados
export interface TaskFilters {
  status?: TaskStatus | ''
  priority_id?: number | ''
  search?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
  overdue?: boolean
  tag_ids?: number[]
}

// Respuesta de paginación actualizada según API real
export interface PaginationInfo {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
  has_more_pages: boolean
}

export interface PaginationLinks {
  first: string[] | null
  last: string[] | null
  prev: string[] | null
  next: string[] | null
  current: string
}

export interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  path: string
  per_page: number
  to: number
  total: number
  timestamp: string
  applied_filters: any[]
}

// Filtros disponibles según API
export interface AvailableFilters {
  available_statuses: Array<{
    value: TaskStatus
    label: string
  }>
  sort_options: Array<{
    value: string
    label: string
  }>
  sort_directions: Array<{
    value: 'asc' | 'desc'
    label: string
  }>
}

// Respuesta completa del API
export interface TasksApiResponse {
  data: Task[]
  pagination: PaginationInfo
  links: PaginationLinks
  meta: PaginationMeta
  filters: AvailableFilters
}

// Respuesta simple para compatibilidad
export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

// Respuestas de la API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Estados del store actualizados
export interface TasksState {
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  error: string | null
  priorities: Priority[]
  tags: Tag[]
  pagination: PaginationInfo
  filters: TaskFilters
  availableFilters: AvailableFilters | null
}

// Helpers para trabajar con la nueva estructura
export interface TaskHelpers {
  getStatusValue: (task: Task) => TaskStatus
  getStatusLabel: (task: Task) => string
  getStatusColor: (task: Task) => string
  getPriorityName: (task: Task) => string
  getPriorityColor: (task: Task) => string
  isOverdue: (task: Task) => boolean
  canEdit: (task: Task) => boolean
  getDaysUntilDue: (task: Task) => number
  getFormattedDueDate: (task: Task) => string | null
}