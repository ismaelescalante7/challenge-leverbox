import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'
import { taskService } from '@/services/taskService'
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  Priority,
  Tag,
  TaskStatus,
} from '@/types/task'

export const useTasksStore = defineStore('tasks', () => {
  // ==========================================
  // STATE
  // ==========================================
  const tasks: Ref<Task[]> = ref([])
  const currentTask: Ref<Task | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const priorities: Ref<Priority[]> = ref([])
  const tags: Ref<Tag[]> = ref([])

  const selectedTasks: Ref<number[]> = ref([])
  const isInitialized = ref(false)

  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  })

  const filters: Ref<TaskFilters> = ref({
    status: '',
    priority_id: '',
    tag_ids: [],
    search: '',
    overdue: false,
    sort_by: 'created_at',
    sort_direction: 'desc',
    page: 1,
    per_page: 10
  })

  // ==========================================
  // GETTERS
  // ==========================================
  const tasksByStatus = computed(() => ({
    pending: tasks.value.filter(task => task.status === 'pending'),
    in_progress: tasks.value.filter(task => task.status === 'in_progress'),
    completed: tasks.value.filter(task => task.status === 'completed')
  }))

  // ==========================================
  // ACTIONS
  // ==========================================
  async function initialize(): Promise<void> {
    try {
      await Promise.all([
        fetchTasks(),
        //fetchPriorities(),
        //fetchTags()
      ])
      isInitialized.value = true
    } catch (err) {
      console.error('Failed to initialize tasks store:', err)
    }
  }

  async function fetchTasks(page: number = pagination.value.current_page): Promise<void> {
    loading.value = true
    error.value = null
    console.log('entree')
    try {
      const params = { ...filters.value, page, per_page: pagination.value.per_page }
      const response = await taskService.getTasks(params)
      console.log(response)
      tasks.value = response.data
      pagination.value = {
        current_page: response.current_page,
        per_page: response.per_page,
        total: response.total,
        last_page: response.last_page
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch tasks'
    } finally {
      loading.value = false
    }
  }

  async function fetchTask(id: number): Promise<Task | null> {
    loading.value = true
    error.value = null

    try {
      const task = await taskService.getTask(id)
      currentTask.value = task
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) tasks.value[index] = task
      return task
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch task'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData: CreateTaskDto): Promise<Task | null> {
    loading.value = true
    error.value = null

    try {
      const newTask = await taskService.createTask(taskData)
      tasks.value.unshift(newTask)
      return newTask
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create task'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: number, taskData: UpdateTaskDto): Promise<Task | null> {
    loading.value = true
    error.value = null

    try {
      const updatedTask = await taskService.updateTask(id, taskData)
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) tasks.value[index] = updatedTask
      if (currentTask.value?.id === id) currentTask.value = updatedTask
      return updatedTask
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update task'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task | null> {
    loading.value = true
    error.value = null

    try {
      const updatedTask = await taskService.updateTaskStatus(id, status)
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) tasks.value[index] = updatedTask
      if (currentTask.value?.id === id) currentTask.value = updatedTask
      return updatedTask
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update task status'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter(task => task.id !== id)
      if (currentTask.value?.id === id) currentTask.value = null
      selectedTasks.value = selectedTasks.value.filter(taskId => taskId !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete task'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function bulkUpdateTasks(taskIds: number[], updateData: Partial<UpdateTaskDto>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await taskService.bulkUpdateTasks({ task_ids: taskIds, ...updateData })
      await fetchTasks(pagination.value.current_page)
      selectedTasks.value = []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update tasks'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function bulkDeleteTasks(taskIds: number[]): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await taskService.bulkDeleteTasks({ task_ids: taskIds })
      tasks.value = tasks.value.filter(task => !taskIds.includes(task.id))
      selectedTasks.value = []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete tasks'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchTasks(query: string): Promise<void> {
    if (!query.trim()) return fetchTasks(1)

    loading.value = true
    error.value = null

    try {
      const searchResults = await taskService.searchTasks({ q: query })
      tasks.value = searchResults
      pagination.value = {
        current_page: 1,
        per_page: searchResults.length,
        total: searchResults.length,
        last_page: 1
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search tasks'
    } finally {
      loading.value = false
    }
  }

  async function fetchPriorities(): Promise<void> {
    try {
      priorities.value = await taskService.getPriorities()
    } catch (err) {
      console.error('Error fetching priorities:', err)
    }
  }

  async function fetchTags(): Promise<void> {
    try {
      tags.value = await taskService.getTags()
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  function updateFilters(newFilters: Partial<TaskFilters>): void {
    filters.value = { ...filters.value, ...newFilters }
    fetchTasks(1)
  }

  function clearFilters(): void {
    filters.value = {
      status: '',
      priority_id: '',
      tag_ids: [],
      search: '',
      overdue: false,
      sort_by: 'created_at',
      sort_direction: 'desc',
      page: 1,
      per_page: 10
    }
    fetchTasks(1)
  }

  function toggleTaskSelection(taskId: number): void {
    const index = selectedTasks.value.indexOf(taskId)
    index > -1
      ? selectedTasks.value.splice(index, 1)
      : selectedTasks.value.push(taskId)
  }

  function selectAllTasks(): void {
    selectedTasks.value = tasks.value.map(task => task.id)
  }

  function clearSelection(): void {
    selectedTasks.value = []
  }

  function clearError(): void {
    error.value = null
  }

  function $reset(): void {
    tasks.value = []
    currentTask.value = null
    loading.value = false
    error.value = null
    selectedTasks.value = []
    isInitialized.value = false
    pagination.value = {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1
    }
    clearFilters()
  }

  return {
    tasks,
    currentTask,
    loading,
    error,
    priorities,
    tags,
    pagination,
    filters,
    selectedTasks,
    isInitialized,
    tasksByStatus,
    initialize,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
    searchTasks,
    fetchPriorities,
    fetchTags,
    updateFilters,
    clearFilters,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    clearError,
    $reset
  }
})