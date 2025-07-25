export interface User {
    id: number
    name: string
    email: string
  }
  
  export interface LoginCredentials {
    email: string
    password: string
  }
  
  export interface RegisterData {
    name: string
    email: string
    password: string
    password_confirmation: string
  }
  
  export interface AuthResponse {
    success: boolean
    message: string
    data: {
      user: User
      token: string
    }
  }
  export interface UserResponse {
    success: boolean
    data: {
      user: User
    }
  }