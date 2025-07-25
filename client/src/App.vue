<template>
  <!-- Loading Screen -->
  <AppLoading
    v-if="!tasksStore.initialized && !initError"
    :loading="tasksStore.loading"
    :loading-tasks="tasksStore.loading"
    :loading-priorities="tasksStore.loadingPriorities"
    :loading-tags="tasksStore.loadingTags"
    :error="initError"
    @retry="initializeApp"
  />
  
  <!-- Main App -->
  <div v-else id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white shadow mb-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <DocumentTextIcon class="w-6 h-6 text-blue-600 mr-2" />
            <h1 class="text-xl font-bold text-gray-900">📋 Task Management</h1>
          </div>
          
          <div class="flex space-x-4 items-center">
            <router-link 
              to="/" 
              class="nav-link"
              active-class="nav-link-active"
            >
              <HomeIcon class="w-4 h-4 mr-1" />
              Dashboard
            </router-link>
            <router-link 
              to="/tasks" 
              class="nav-link"
              active-class="nav-link-active"
            >
              <DocumentTextIcon class="w-4 h-4 mr-1" />
              Tasks
            </router-link>
            
            <!-- Stats Badge -->
            <div class="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {{ tasksStore.taskStats.total }} tasks
              </span>
              <span 
                v-if="tasksStore.taskStats.overdue > 0"
                class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ tasksStore.taskStats.overdue }} overdue
              </span>
            </div>
            
            <!-- Refresh Button -->
            <button
              @click="refreshAll"
              :disabled="tasksStore.isLoading"
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh all data"
            >
              <ArrowPathIcon 
                class="w-5 h-5" 
                :class="{ 'animate-spin': tasksStore.isLoading }"
              />
            </button>
            <button
              v-if="isAuthenticated"
              @click="logout"
              class="p-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4">
      <!-- Router View -->
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    
    <!-- Footer -->
    <footer class="mt-16 bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            Task Management System
          </p>
          <div class="flex items-center space-x-4 text-xs text-gray-400">
            <span>{{ tasksStore.taskStats.total }} Total Tasks</span>
            <span>{{ tasksStore.priorities.length }} Priorities</span>
            <span>{{ tasksStore.tags.length }} Tags</span>
            <span v-if="lastRefresh">
              Last updated: {{ lastRefresh }}
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { 
  DocumentTextIcon, 
  HomeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useTasksStore } from '@/stores/useTasksStore'
import { useNotifications } from '@/composables/useNotifications'
import AppLoading from '@/components/AppLoading.vue'
import { useAuth } from '@/composables/useAuth'

const { logout, isAuthenticated } = useAuth()
const tasksStore = useTasksStore()
const { showError, showSuccess } = useNotifications()

const initError = ref<string | null>(null)
const lastRefresh = ref<string>('')

const initializeApp = async (): Promise<void> => {
  initError.value = null
  
  try {
    await tasksStore.initialize()
    updateLastRefresh()
  } catch (error: any) {
    initError.value = error.message || 'Failed to load application data'
  }
}

const refreshAll = async (): Promise<void> => {
  try {
    await tasksStore.refreshAll()
    updateLastRefresh()
    showSuccess('Data refreshed successfully')
  } catch (error: any) {
    showError('Failed to refresh data')
  }
}

const updateLastRefresh = (): void => {
  lastRefresh.value = new Date().toLocaleTimeString()
}

// Watch for errors
watch(() => tasksStore.error, (newError) => {
  if (newError) {
    showError(newError)
  }
})

// Initialize on mount
onMounted(async () => {
  await initializeApp()
})
</script>

<style scoped>
/* Navigation */
.nav-link {
  @apply flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors;
}

.nav-link-active {
  @apply text-blue-600 bg-blue-50 font-semibold;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nav-link {
    @apply px-2 py-1 text-xs;
  }
}
</style>