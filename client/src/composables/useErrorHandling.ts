import { ref, computed } from 'vue'
import type { AxiosError } from 'axios'

// Types
interface StoreError {
  message: string
  type: 'validation' | 'network' | 'server' | 'unknown'
  validationErrors?: Record<string, string[]>
  statusCode?: number
}

interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  error_type?: string
  validation_failed?: boolean
  http_status?: number
}

export function useErrorHandling() {
  const error = ref<StoreError | null>(null)
  
  // Parse error from API response
  const parseError = (err: any): StoreError => {
    console.log('🔍 Parsing error:', err)
    
    // Si es un AxiosError con respuesta del servidor
    if (err.isAxiosError && err.response) {
      const response = err.response
      const data: ApiErrorResponse = response.data || {}
      
      // Error de validación (422)
      if (response.status === 422 || data.validation_failed || data.error_type === 'validation') {
        return {
          message: data.message || 'Validation failed',
          type: 'validation',
          validationErrors: data.errors || {},
          statusCode: response.status
        }
      }
      
      // Error del servidor (500)
      if (response.status >= 500) {
        return {
          message: data.message || 'Server error occurred',
          type: 'server',
          statusCode: response.status
        }
      }
      
      // Error de autenticación (401)
      if (response.status === 401) {
        return {
          message: data.message || 'Authentication required',
          type: 'server',
          statusCode: response.status
        }
      }
      
      // Error de autorización (403)
      if (response.status === 403) {
        return {
          message: data.message || 'Access denied',
          type: 'server',
          statusCode: response.status
        }
      }
      
      // Not found (404)
      if (response.status === 404) {
        return {
          message: data.message || 'Resource not found',
          type: 'server',
          statusCode: response.status
        }
      }
      
      // Otros errores del servidor (400, etc.)
      return {
        message: data.message || `Server error (${response.status})`,
        type: 'server',
        statusCode: response.status
      }
    }
    
    // Error de timeout
    if (err.isAxiosError && err.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout - please try again',
        type: 'network'
      }
    }
    
    // Error de red (sin respuesta del servidor)
    if (err.isAxiosError && !err.response) {
      return {
        message: 'Network error - please check your connection',
        type: 'network'
      }
    }
    
    // Error genérico
    return {
      message: err.message || 'An unexpected error occurred',
      type: 'unknown'
    }
  }
  
  // Set error
  const setError = (err: any): StoreError => {
    const parsedError = parseError(err)
    error.value = parsedError
    return parsedError
  }
  
  // Clear error
  const clearError = (): void => {
    error.value = null
  }
  
  // Computed properties
  const hasError = computed(() => !!error.value)
  
  const hasValidationErrors = computed(() => 
    error.value?.type === 'validation' && !!error.value.validationErrors
  )
  
  const isNetworkError = computed(() => error.value?.type === 'network')
  
  const isServerError = computed(() => error.value?.type === 'server')
  
  const errorMessage = computed(() => error.value?.message || '')
  
  const validationErrors = computed(() => error.value?.validationErrors || {})
  
  // Helper methods
  const getFieldErrors = (fieldName: string): string[] => {
    if (!error.value?.validationErrors) return []
    return error.value.validationErrors[fieldName] || []
  }
  
  const hasFieldError = (fieldName: string): boolean => {
    return getFieldErrors(fieldName).length > 0
  }
  
  const getFirstFieldError = (fieldName: string): string | null => {
    const errors = getFieldErrors(fieldName)
    return errors.length > 0 ? errors[0] : null
  }
  
  // Format field name for display
  const formatFieldName = (field: string): string => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  
  // Get error title based on type
  const getErrorTitle = (errorType?: string): string => {
    switch (errorType) {
      case 'validation':
        return 'Validation Error'
      case 'network':
        return 'Connection Error'
      case 'server':
        return 'Server Error'
      default:
        return 'Error'
    }
  }
  
  // Check if error is retryable
  const isRetryable = computed(() => {
    return error.value?.type === 'network' || 
           (error.value?.type === 'server' && error.value.statusCode >= 500)
  })
  
  // Handle async operation with error catching
  const handleAsync = async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: StoreError) => void
  ): Promise<T | null> => {
    try {
      clearError()
      const result = await operation()
      onSuccess?.(result)
      return result
    } catch (err) {
      const parsedError = setError(err)
      onError?.(parsedError)
      throw parsedError
    }
  }
  
  return {
    // State
    error,
    
    // Computed
    hasError,
    hasValidationErrors,
    isNetworkError,
    isServerError,
    errorMessage,
    validationErrors,
    isRetryable,
    
    // Methods
    setError,
    clearError,
    parseError,
    getFieldErrors,
    hasFieldError,
    getFirstFieldError,
    formatFieldName,
    getErrorTitle,
    handleAsync
  }
}

// Utility function para usar globalmente
export const createErrorHandler = () => useErrorHandling()