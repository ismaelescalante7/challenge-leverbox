<template>
    <div class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead class="table-header">
            <tr>
              <th>
                <input
                  type="checkbox"
                  :checked="allTasksSelected"
                  :indeterminate="someTasksSelected"
                  @change="toggleSelectAll"
                  class="form-checkbox"
                />
              </th>
              <th>Task</th>
              <th>Status</th>
              <th v-if="priorities.length > 0">Priority</th>
              <th>Due Date</th>
              <th>Created</th>
              <th class="w-32">Actions</th>
            </tr>
          </thead>
          
          <tbody class="table-body">
            <!-- Loading State -->
            <tr v-if="loading && tasks.length === 0">
              <td :colspan="priorities.length > 0 ? 7 : 6" class="table-cell text-center py-12">
                <div class="flex flex-col items-center space-y-3">
                  <div class="loading-spinner w-8 h-8"></div>
                  <span class="text-gray-500">Loading tasks...</span>
                </div>
              </td>
            </tr>
            
            <!-- Empty State -->
            <tr v-else-if="!loading && tasks.length === 0">
              <td :colspan="priorities.length > 0 ? 7 : 6" class="table-cell text-center py-12">
                <div class="flex flex-col items-center space-y-3">
                  <DocumentTextIcon class="w-12 h-12 text-gray-300" />
                  <div>
                    <p class="text-gray-500 text-lg font-medium">{{ emptyTitle }}</p>
                    <p class="text-gray-400 text-sm mt-1">{{ emptyMessage }}</p>
                  </div>
                  <button
                    v-if="emptyAction && !hasActiveFilters"
                    @click="$emit('emptyAction')"
                    class="btn-primary btn-sm"
                  >
                    <PlusIcon class="w-4 h-4 mr-2" />
                    {{ emptyAction }}
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Task Rows -->
            <tr v-else v-for="task in tasks" :key="task.id" class="table-row">
              <td class="table-cell">
                <input
                  type="checkbox"
                  :value="task.id"
                  :checked="selectedTasks.includes(task.id)"
                  @change="toggleTaskSelection(task.id)"
                  class="form-checkbox"
                />
              </td>
  
              <td class="table-cell">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ task.title }}
                  </div>
                  <div v-if="task.description" class="text-sm text-gray-500 truncate max-w-xs">
                    {{ task.description }}
                  </div>
                  <div v-if="task.tags && task.tags.length > 0" class="mt-1 flex flex-wrap gap-1">
                    <span
                      v-for="tag in task.tags"
                      :key="tag.id"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :style="{ 
                        backgroundColor: tag.color + '20', 
                        color: tag.color,
                        borderColor: tag.color + '50'
                      }"
                      style="border: 1px solid;"
                    >
                      {{ tag.label || tag.name }}
                    </span>
                  </div>
                </div>
              </td>
  
              <td class="table-cell">
                <TaskStatusBadge :status="task.status" />
              </td>
  
              <td v-if="priorities.length > 0" class="table-cell">
                <TaskPriorityBadge v-if="task.priority" :priority="task.priority" />
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
  
              <td class="table-cell">
                <div v-if="task.dates?.due_date">
                  <div :class="getDateStatusClasses(task.dates.due_date)">
                    {{ formatDate(task.dates.due_date) }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ getRelativeDate(task.dates.due_date) }}
                  </div>
                  <div v-if="task.dates.is_overdue" class="text-xs text-red-600 font-medium">
                    Overdue
                  </div>
                </div>
                <span v-else class="text-gray-400 text-sm">No due date</span>
              </td>
  
              <td class="table-cell">
                <div class="text-sm text-gray-900">
                  {{ formatDate(task.dates?.created_at) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getTimeAgo(task.dates?.created_at) }}
                </div>
              </td>
  
              <td class="table-cell">
                <div class="flex space-x-2">
                  <button
                    @click="$emit('viewTask', task)"
                    class="text-blue-600 hover:text-blue-900 text-sm transition-colors"
                    title="View details"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="$emit('editTask', task)"
                    class="text-green-600 hover:text-green-900 text-sm transition-colors"
                    title="Edit task"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="$emit('deleteTask', task)"
                    class="text-red-600 hover:text-red-900 text-sm transition-colors"
                    title="Delete task"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Bulk Actions -->
      <div v-if="selectedTasks.length > 0" class="px-6 py-4 bg-blue-50 border-t border-blue-200">
        <div class="flex items-center justify-between">
          <span class="text-sm text-blue-700 font-medium">
            {{ selectedTasks.length }} task{{ selectedTasks.length !== 1 ? 's' : '' }} selected
          </span>
          <div class="flex space-x-2">
            <button 
              @click="$emit('bulkAction', { action: 'complete', taskIds: selectedTasks })" 
              class="btn-success btn-sm"
            >
              Mark Complete
            </button>
            <button 
              @click="$emit('bulkAction', { action: 'delete', taskIds: selectedTasks })" 
              class="btn-danger btn-sm"
            >
              Delete Selected
            </button>
            <button 
              @click="clearSelection" 
              class="btn-outline btn-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
  
      <!-- Pagination -->
      <div v-if="pagination && pagination.total > 0" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ startItem }} to {{ endItem }} of {{ pagination.total }} results
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="$emit('pageChange', pagination.current_page - 1)"
              :disabled="pagination.current_page === 1 || loading"
              class="btn-outline btn-sm"
            >
              <ChevronLeftIcon class="w-4 h-4" />
              Previous
            </button>
            
            <span class="px-3 py-1 text-sm text-gray-700">
              Page {{ pagination.current_page }} of {{ pagination.last_page }}
            </span>
            
            <button
              @click="$emit('pageChange', pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page || loading"
              class="btn-outline btn-sm"
            >
              Next
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { 
    DocumentTextIcon, 
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon
  } from '@heroicons/vue/24/outline'
  import TaskStatusBadge from '@/components/tasks/TaskStatusBadge.vue'
  import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge.vue'
  import { useDateUtils } from '@/composables/useDateUtils'
  import type { Task, Priority, Pagination } from '@/types/task'
  
  interface Props {
    tasks: Task[]
    priorities: Priority[]
    selectedTasks: number[]
    pagination?: Pagination
    loading?: boolean
    hasActiveFilters?: boolean
    emptyTitle?: string
    emptyMessage?: string
    emptyAction?: string
  }
  
  interface Emits {
    (e: 'update:selectedTasks', tasks: number[]): void
    (e: 'viewTask', task: Task): void
    (e: 'editTask', task: Task): void
    (e: 'deleteTask', task: Task): void
    (e: 'bulkAction', data: { action: string, taskIds: number[] }): void
    (e: 'pageChange', page: number): void
    (e: 'emptyAction'): void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    hasActiveFilters: false,
    emptyTitle: 'No tasks found',
    emptyMessage: 'Create your first task to get started',
    emptyAction: 'Create Task'
  })
  
  const emit = defineEmits<Emits>()
  
  // Composables
  const { formatDate, getRelativeDate, getTimeAgo, getDateStatusClasses } = useDateUtils()
  
  // Computed
  const allTasksSelected = computed(() => 
    props.tasks.length > 0 && props.selectedTasks.length === props.tasks.length
  )
  
  const someTasksSelected = computed(() => 
    props.selectedTasks.length > 0 && props.selectedTasks.length < props.tasks.length
  )
  
  const startItem = computed(() => {
    if (!props.pagination) return 1
    return (props.pagination.current_page - 1) * props.pagination.per_page + 1
  })
  
  const endItem = computed(() => {
    if (!props.pagination) return props.tasks.length
    return Math.min(props.pagination.current_page * props.pagination.per_page, props.pagination.total)
  })
  
  // Methods
  const toggleSelectAll = (): void => {
    if (allTasksSelected.value) {
      emit('update:selectedTasks', [])
    } else {
      emit('update:selectedTasks', props.tasks.map(task => task.id))
    }
  }
  
  const toggleTaskSelection = (taskId: number): void => {
    const currentSelection = [...props.selectedTasks]
    const index = currentSelection.indexOf(taskId)
    
    if (index > -1) {
      currentSelection.splice(index, 1)
    } else {
      currentSelection.push(taskId)
    }
    
    emit('update:selectedTasks', currentSelection)
  }
  
  const clearSelection = (): void => {
    emit('update:selectedTasks', [])
  }
  </script>
  
  <style scoped>
  .card {
    @apply bg-white overflow-hidden shadow rounded-lg;
  }
  
  .table {
    @apply min-w-full divide-y divide-gray-200;
  }
  
  .table-header {
    @apply bg-gray-50;
  }
  
  .table-header th {
    @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
  }
  
  .table-body {
    @apply bg-white divide-y divide-gray-200;
  }
  
  .table-cell {
    @apply px-6 py-4 whitespace-nowrap;
  }
  
  .table-row {
    transition: all 0.2s ease;
  }
  
  .table-row:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .form-checkbox {
    @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
  }
  
  .btn-primary {
    @apply inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700;
  }
  
  .btn-success {
    @apply inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700;
  }
  
  .btn-danger {
    @apply inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700;
  }
  
  .btn-outline {
    @apply inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-sm {
    @apply px-3 py-1.5 text-xs;
  }
  
  .loading-spinner {
    @apply animate-spin rounded-full border-2 border-gray-300 border-t-blue-600;
  }
  
  /* Custom checkbox indeterminate state */
  input[type="checkbox"]:indeterminate {
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4 8h8'/%3e%3c/svg%3e");
  }
  
  /* Custom scrollbar for table */
  .overflow-x-auto::-webkit-scrollbar {
    height: 6px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  </style>