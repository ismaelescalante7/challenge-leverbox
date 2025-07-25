<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <DocumentTextIcon class="h-8 w-8 text-blue-600" />
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Regístrate para acceder al sistema de gestión de tareas
          </p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <!-- Nombre -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                autocomplete="name"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Tu nombre completo"
              />
            </div>
  
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
  
            <!-- Contraseña -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
  
            <!-- Confirmar Contraseña -->
            <div>
              <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="password_confirmation"
                v-model="form.password_confirmation"
                name="password_confirmation"
                type="password"
                autocomplete="new-password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Repite tu contraseña"
              />
            </div>
          </div>
  
          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">{{ error }}</p>
              </div>
            </div>
          </div>
  
          <!-- Password Requirements -->
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <InformationCircleIcon class="h-5 w-5 text-blue-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">
                  Requisitos de contraseña:
                </h3>
                <ul class="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Mínimo 8 caracteres</li>
                  <li>Las contraseñas deben coincidir</li>
                </ul>
              </div>
            </div>
          </div>
  
          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowPathIcon class="h-5 w-5 text-white animate-spin" />
              </span>
              {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </button>
          </div>
  
          <!-- Login Link -->
          <div class="text-center">
            <router-link 
              to="/login" 
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, computed } from 'vue'
  import { 
    DocumentTextIcon, 
    ExclamationTriangleIcon, 
    ArrowPathIcon,
    InformationCircleIcon 
  } from '@heroicons/vue/24/outline'
  import { useAuth } from '@/composables/useAuth'
  import type { RegisterData } from '@/types/auth'
  
  const { register, loading, error, clearError } = useAuth()
  
  const form = reactive<RegisterData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  
  const isFormValid = computed(() => {
    return form.name.trim() !== '' &&
           form.email.trim() !== '' &&
           form.password.length >= 8 &&
           form.password === form.password_confirmation
  })
  
  const handleSubmit = async () => {
    clearError()
    
    if (!isFormValid.value) {
      return
    }
  
    try {
      await register(form)
    } catch (error) {
      // Error is handled by the composable
      console.error('Registration failed:', error)
    }
  }
  </script>
  
  <style scoped>
  /* Transitions para mejor UX */
  .transition-all {
    transition: all 0.2s ease-in-out;
  }
  
  /* Focus states mejorados */
  input:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  /* Button hover effects */
  button:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }
  
  button:disabled {
    transform: none;
    box-shadow: none;
  }
  </style>