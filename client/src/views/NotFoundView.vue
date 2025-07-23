<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 text-center">
        <div>
          <ExclamationTriangleIcon class="mx-auto h-24 w-24 text-gray-400" />
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Page not found
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div class="space-y-4">
          <router-link
            to="/tasks"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HomeIcon class="w-5 h-5 mr-2" />
            Go to Tasks
          </router-link>
          
          <button
            @click="goBack"
            class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            Go back
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
  
  const router = useRouter()
  
  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/tasks')
    }
  }
  </script>