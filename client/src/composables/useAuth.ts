import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios, { type AxiosResponse } from '@/plugins/axios'
import type { User, LoginCredentials, RegisterData, AuthResponse, UserResponse } from '@/types/auth'

const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem('auth_token'))
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// Configurar axios
if (token.value) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
}

export const useAuth = () => {
  const router = useRouter()

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  const setAuthData = (userData: User, authToken: string) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  const clearAuthData = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    delete axios.defaults.headers.common['Authorization']
  }

  const login = async (credentials: LoginCredentials): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response: AxiosResponse<AuthResponse> = await axios.post('/api/login', credentials)
      
      if (response.data.success) {
        setAuthData(response.data.data.user, response.data.data.token)
        await router.push('/')
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.response?.data?.errors?.email) {
        error.value = err.response.data.errors.email[0]
      } else {
        error.value = 'Error al iniciar sesión'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response: AxiosResponse<AuthResponse> = await axios.post('/api/register', data)
      
      if (response.data.success) {
        setAuthData(response.data.data.user, response.data.data.token)
        await router.push('/')
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.response?.data?.errors) {
        // Manejar errores de validación
        const firstError = Object.values(err.response.data.errors)[0] as string[]
        error.value = firstError[0]
      } else {
        error.value = 'Error al registrar usuario'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true

    try {
      if (token.value) {
        await axios.post('/api/logout')
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    } finally {
      clearAuthData()
      await router.push('/login')
      loading.value = false
    }
  }

  const fetchUser = async (): Promise<void> => {
    if (!token.value) return

    try {
      const response: AxiosResponse<UserResponse> = await axios.get('/api/user')
      console.log('User fetch response:', response.data)
      
      if (response.data.success) {
        user.value = response.data.data.user
        console.log('User set from fetch:', user.value)
      }
    } catch (err) {
      console.error('Error al obtener usuario:', err)
      clearAuthData()
    }
  }

  const initializeAuth = async (): Promise<void> => {
    if (token.value) {
      await fetchUser()
    }
  }

  return {
    // State
    user: computed(() => user.value),
    token: computed(() => token.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    fetchUser,
    initializeAuth,
    clearError: () => { error.value = null }
  }
}