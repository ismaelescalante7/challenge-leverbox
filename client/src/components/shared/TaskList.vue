<template>
  <div class="card">
    <div class="card-header">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <div class="flex items-center space-x-2">
          <span v-if="showCount" class="text-sm text-gray-500">
            {{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }}
          </span>
          <router-link 
            v-if="viewAllLink" 
            :to="viewAllLink" 
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <!-- Empty State -->
      <div v-if="tasks.length === 0" class="text-center py-8">
        <component 
          :is="emptyIcon" 
          class="w-12 h-12 text-gray-300 mx-auto mb-4" 
        />
        <p class="text-gray-500 mb-2">{{ emptyMessage }}</p>
        <p v-if="emptySubtext" class="text-gray-400 text-sm">{{ emptySubtext }}</p>
        <router-link 
          v-if="emptyAction"
          :to="emptyAction.link" 
          class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
        >
          {{ emptyAction.text }}
        </router-link>
      </div>

      <!-- Task List -->
      <div v-else class="space-y-3">
        <div
          v-for="task in displayTasks"
          :key="task.id"
          class="task-item"
          :class="taskItemClasses(task)"
        >
          <div class="flex-1">
            <!-- Task Title -->
            <router-link
              :to="`/tasks/${task.id}`"
              class="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {{ task.title }}
            </router-link>
            
            <!-- Task Meta -->
            <div class="flex items-center mt-1 space-x-2">
              <TaskPriorityBadge
                v-if="task.priority && showPriority"
                :priority="task.priority"
                size="sm"
              />
              
              <!-- ✅ CORREGIDO: Usar task.due_date directamente -->
              <span v-if="task.due_date && showDueDate" class="text-xs text-gray-500">
                Due {{ formatDate(task.due_date) }}
              </span>
              
              <!-- ✅ CORREGIDO: Usar taskHelpers.isOverdue -->
              <span v-if="taskHelpers.isOverdue(task)" class="text-xs text-red-600 font-medium">
                Overdue
              </span>
              
              <div v-if="task.tags && task.tags.length > 0 && showTags" class="flex space-x-1">
                <span
                  v-for="tag in task.tags.slice(0, maxTags)"
                  :key="tag.id"
                  class="inline-block w-2 h-2 rounded-full bg-gray-400"
                  :style="tag.color ? { backgroundColor: tag.color } : {}"
                  :title="tag.name || tag.label"
                ></span>
                <span 
                  v-if="task.tags.length > maxTags" 
                  class="text-xs text-gray-400"
                >
                  +{{ task.tags.length - maxTags }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="showActions" class="ml-4 flex items-center space-x-2">
            <button
              v-if="allowMarkComplete && taskHelpers.getStatusValue(task) !== 'completed'"
              @click="$emit('markAsCompleted', task.id)"
              class="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Mark as completed"
              :disabled="actionLoading"
            >
              <div v-if="actionLoading" class="loading-spinner w-4 h-4"></div>
              <CheckIcon v-else class="w-5 h-5" />
            </button>
            
            <button
              v-if="allowEdit"
              @click="$emit('editTask', task)"
              class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit task"
              :disabled="actionLoading"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Show More -->
        <div v-if="tasks.length > limit && !showAll" class="text-center pt-4 border-t border-gray-100">
          <button 
            @click="toggleShowAll"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Show {{ tasks.length - limit }} more tasks
          </button>
        </div>
        
        <div v-else-if="showAll && tasks.length > limit" class="text-center pt-4 border-t border-gray-100">
          <button 
            @click="toggleShowAll"
            class="text-gray-600 hover:text-gray-700 text-sm"
          >
            Show less
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon, PlayIcon, ClockIcon } from '@heroicons/vue/24/solid'
import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge.vue'
import { useDateUtils } from '@/composables/useDateUtils'
import { useStatusColors } from '@/composables/useStatusColors'
import { taskHelpers } from '@/services/taskService'
import type { Task } from '@/types/task'

interface EmptyAction {
  text: string
  link: string
}

interface Props {
  title: string
  tasks: Task[]
  limit?: number
  variant?: 'default' | 'pending' | 'progress' | 'completed'
  emptyMessage?: string
  emptySubtext?: string
  emptyAction?: EmptyAction
  viewAllLink?: string
  showCount?: boolean
  showPriority?: boolean
  showDueDate?: boolean
  showTags?: boolean
  showActions?: boolean
  allowMarkComplete?: boolean
  allowEdit?: boolean
  maxTags?: number
  actionLoading?: boolean
}

interface Emits {
  (e: 'markAsCompleted', taskId: number): void
  (e: 'editTask', task: Task): void
}

const props = withDefaults(defineProps<Props>(), {
  limit: 5,
  variant: 'default',
  emptyMessage: 'No tasks found',
  showCount: true,
  showPriority: true,
  showDueDate: true,
  showTags: true,
  showActions: true,
  allowMarkComplete: true,
  allowEdit: false,
  maxTags: 3,
  actionLoading: false
})

defineEmits<Emits>()

const { formatDate } = useDateUtils()
const { getStatusCardClasses } = useStatusColors()

const showAll = ref(false)

const displayTasks = computed(() => {
  return showAll.value ? props.tasks : props.tasks.slice(0, props.limit)
})

const emptyIcon = computed(() => {
  const icons = {
    pending: ClockIcon,
    progress: PlayIcon,
    completed: CheckCircleIcon,
    default: CheckCircleIcon
  }
  return icons[props.variant] || icons.default
})

const toggleShowAll = (): void => {
  showAll.value = !showAll.value
}

const taskItemClasses = (task: Task): string => {
  const baseClasses = 'flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer'
  
  if (taskHelpers.isOverdue(task)) {
    return `${baseClasses} ${getStatusCardClasses('overdue')}`
  }
  
  return `${baseClasses} ${getStatusCardClasses(props.variant)}`
}
</script>

<style scoped>
.card {
  @apply bg-white overflow-hidden shadow rounded-lg;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-body {
  @apply px-6 py-4;
}

.task-item {
  position: relative;
}

.task-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 0 2px 2px 0;
  transition: background-color 0.2s;
}

.task-item:hover::before {
  background-color: currentColor;
}

/* Loading spinner */
.loading-spinner {
  @apply animate-spin rounded-full border-2 border-gray-300 border-t-green-600;
}
</style>