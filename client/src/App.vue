<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-3">
              <div class="p-2 bg-blue-600 rounded-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4">
                  </path>
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">Task Manager</h1>
                <p class="text-xs text-gray-500">Laravel 12 + Vue 3</p>
              </div>
            </router-link>
          </div>

          <!-- Navigation Links -->
          <nav class="hidden md:flex space-x-8">
            <router-link 
              to="/" 
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/' }"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/tasks" 
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/tasks' }"
            >
              Tasks
            </router-link>
          </nav>

          <!-- Actions -->
          <div class="flex items-center space-x-4">
            <!-- Health Status -->
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  isApiHealthy ? 'bg-green-400' : 'bg-red-400'
                ]"
              ></div>
              <span class="text-sm text-gray-600">
                {{ isApiHealthy ? 'Connected' : 'Disconnected' }}
              </span>
            </div>

            <!-- Mobile menu button -->
            <button 
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-if="showMobileMenu" class="md:hidden pb-4">
          <div class="flex flex-col space-y-2">
            <router-link 
              to="/" 
              @click="showMobileMenu = false"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/tasks" 
              @click="showMobileMenu = false"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Tasks
            </router-link>
            <router-link 
              to="/reports" 
              @click="showMobileMenu = false"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Reports
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <!-- Loading Overlay -->
      <div 
        v-if="globalLoading" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 shadow-xl">
          <div class="flex items-center space-x-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="text-gray-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>

      <!-- Router View -->
      <router-view v-slot="{ Component }">
        <transition 
          name="page" 
          mode="out-in"
          enter-active-class="duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-gray-600">
            © 2024 Task Management System. Built with Laravel 12 + Vue 3 + TypeScript.
          </div>
          <div class="flex items-center space-x-4 mt-4 md:mt-0">
            <span class="text-xs text-gray-500">Version {{ appVersion }}</span>
            <a 
              href="/api/system/info" 
              target="_blank"
              class="text-xs text-blue-600 hover:text-blue-800"
            >
              System Info
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTasksStore } from '@/stores/useTasksStore';
import { taskService } from '@/services/taskService';
import { useNotifications } from '@/composables/useNotifications';

// Composables
const router = useRouter()
const tasksStore = useTasksStore()
const { showError } = useNotifications()

// State
const showMobileMenu = ref(false)
const globalLoading = ref(false)
const isApiHealthy = ref(true)
const appVersion = ref('1.0.0')

// Health check interval
let healthCheckInterval: number | null = null

// Methods
const checkApiHealth = async (): Promise<void> => {
  try {
    await taskService.healthCheck()
    isApiHealthy.value = true
  } catch (error) {
    isApiHealthy.value = false
    console.error('API health check failed:', error)
  }
}

const initializeApp = async (): Promise<void> => {
  globalLoading.value = true
  
  try {
    // Initialize tasks store
    await tasksStore.initialize()
    
    // Check API health
    await checkApiHealth()
    
    console.log('✅ App initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize app:', error)
    showError('Failed to initialize application. Please refresh the page.')
  } finally {
    globalLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await initializeApp()
  
  // Set up health check interval (every 30 seconds)
  healthCheckInterval = window.setInterval(checkApiHealth, 30000)
  
  // Handle route changes
  router.beforeEach(() => {
    showMobileMenu.value = false
  })
})

onUnmounted(() => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
  }
})
</script>

<style scoped>
/* Page transition styles */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Router link active styles */
.router-link-active {
  @apply text-blue-600 bg-blue-50;
}
</style>