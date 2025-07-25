import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotifications } from '@/composables/useNotifications'
import type { NotificationOptions } from '@/composables/useNotifications'

// Mock de vue-toastification
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  dismiss: vi.fn(),
  clear: vi.fn()
}

vi.mock('vue-toastification', () => ({
  useToast: () => mockToast
}))

describe('useNotifications', () => {
  let notifications: ReturnType<typeof useNotifications>

  beforeEach(() => {
    vi.clearAllMocks()
    notifications = useNotifications()
  })

  describe('showSuccess', () => {
    it('should show success toast with default options', () => {
      const message = 'Operation successful!'
      notifications.showSuccess(message)

      expect(mockToast.success).toHaveBeenCalledWith(message, {
        timeout: 3000,
        position: 'top-right',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })

    it('should show success toast with custom options', () => {
      const message = 'Custom success!'
      const options: NotificationOptions = {
        duration: 5000,
        position: 'bottom-left'
      }
      notifications.showSuccess(message, options)

      expect(mockToast.success).toHaveBeenCalledWith(message, {
        timeout: 5000,
        position: 'bottom-left',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })

    it('should show success toast with partial custom options', () => {
      const message = 'Partial options!'
      const options: NotificationOptions = {
        duration: 2000
      }
      notifications.showSuccess(message, options)

      expect(mockToast.success).toHaveBeenCalledWith(message, {
        timeout: 2000,
        position: 'top-right', // default position
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })
  })

  describe('showError', () => {
    it('should show error toast with default options', () => {
      const message = 'An error occurred!'
      notifications.showError(message)

      expect(mockToast.error).toHaveBeenCalledWith(message, {
        timeout: 5000, // nota: error tiene timeout más largo por defecto
        position: 'top-right',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })

    it('should show error toast with custom options', () => {
      const message = 'Custom error!'
      const options: NotificationOptions = {
        duration: 10000,
        position: 'top-left'
      }
      notifications.showError(message, options)

      expect(mockToast.error).toHaveBeenCalledWith(message, {
        timeout: 10000,
        position: 'top-left',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })
  })

  describe('showWarning', () => {
    it('should show warning toast with default options', () => {
      const message = 'This is a warning!'
      notifications.showWarning(message)

      expect(mockToast.warning).toHaveBeenCalledWith(message, {
        timeout: 4000,
        position: 'top-right',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })

    it('should show warning toast with custom position', () => {
      const message = 'Warning!'
      const options: NotificationOptions = {
        position: 'bottom-right'
      }
      notifications.showWarning(message, options)

      expect(mockToast.warning).toHaveBeenCalledWith(message, {
        timeout: 4000, // default duration para warning
        position: 'bottom-right',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })
  })

  describe('showInfo', () => {
    it('should show info toast with default options', () => {
      const message = 'Information message'
      notifications.showInfo(message)

      expect(mockToast.info).toHaveBeenCalledWith(message, {
        timeout: 3000,
        position: 'top-right',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })

    it('should show info toast with all custom options', () => {
      const message = 'Custom info!'
      const options: NotificationOptions = {
        duration: 7000,
        position: 'bottom-left'
      }
      notifications.showInfo(message, options)

      expect(mockToast.info).toHaveBeenCalledWith(message, {
        timeout: 7000,
        position: 'bottom-left',
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: true
      })
    })
  })

  describe('showLoading', () => {
    it('should show loading toast with default message', () => {
      const toastId = notifications.showLoading()

      expect(mockToast.info).toHaveBeenCalledWith('Loading...', {
        timeout: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        hideProgressBar: true,
        icon: '⏳'
      })
    })

    it('should show loading toast with custom message', () => {
      const customMessage = 'Processing your request...'
      const toastId = notifications.showLoading(customMessage)

      expect(mockToast.info).toHaveBeenCalledWith(customMessage, {
        timeout: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        hideProgressBar: true,
        icon: '⏳'
      })
    })

    it('should return toast id from showLoading', () => {
      const mockToastId = 'toast-123'
      mockToast.info.mockReturnValueOnce(mockToastId)
      
      const toastId = notifications.showLoading()
      
      expect(toastId).toBe(mockToastId)
    })
  })

  describe('dismiss', () => {
    it('should dismiss specific toast when toastId is provided', () => {
      const toastId = 'toast-456'
      notifications.dismiss(toastId)

      expect(mockToast.dismiss).toHaveBeenCalledWith(toastId)
      expect(mockToast.clear).not.toHaveBeenCalled()
    })

    it('should clear all toasts when no toastId is provided', () => {
      notifications.dismiss()

      expect(mockToast.clear).toHaveBeenCalled()
      expect(mockToast.dismiss).not.toHaveBeenCalled()
    })

    it('should dismiss undefined toastId by clearing all', () => {
      notifications.dismiss(undefined)

      expect(mockToast.clear).toHaveBeenCalled()
      expect(mockToast.dismiss).not.toHaveBeenCalled()
    })
  })

  describe('Integration scenarios', () => {
    it('should handle showing and dismissing a loading toast', () => {
      const mockToastId = 'loading-toast-789'
      mockToast.info.mockReturnValueOnce(mockToastId)

      // Mostrar loading
      const toastId = notifications.showLoading('Saving...')
      expect(mockToast.info).toHaveBeenCalledWith('Saving...', expect.any(Object))

      // Dismiss loading específico
      notifications.dismiss(toastId)
      expect(mockToast.dismiss).toHaveBeenCalledWith(mockToastId)
    })

    it('should handle multiple notification types in sequence', () => {
      notifications.showInfo('Starting process...')
      notifications.showWarning('This might take a while')
      notifications.showSuccess('Process completed!')

      expect(mockToast.info).toHaveBeenCalledTimes(1)
      expect(mockToast.warning).toHaveBeenCalledTimes(1)
      expect(mockToast.success).toHaveBeenCalledTimes(1)
    })

    it('should handle error notification after failed operation', () => {
      // Simular una operación fallida
      try {
        throw new Error('Network error')
      } catch (error) {
        notifications.showError('Failed to save: Network error')
      }

      expect(mockToast.error).toHaveBeenCalledWith(
        'Failed to save: Network error',
        expect.objectContaining({
          timeout: 5000,
          position: 'top-right'
        })
      )
    })
  })

  describe('Default timeout values', () => {
    it('should have correct default timeouts for each notification type', () => {
      notifications.showSuccess('Success')
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 3000 })
      )

      notifications.showError('Error')
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 5000 })
      )

      notifications.showWarning('Warning')
      expect(mockToast.warning).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 4000 })
      )

      notifications.showInfo('Info')
      expect(mockToast.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 3000 })
      )
    })
  })

  describe('Position options', () => {
    const positions: NotificationOptions['position'][] = [
      'top-right',
      'top-left',
      'bottom-right',
      'bottom-left'
    ]

    positions.forEach(position => {
      it(`should accept ${position} as valid position`, () => {
        notifications.showSuccess('Test', { position })
        
        expect(mockToast.success).toHaveBeenCalledWith(
          'Test',
          expect.objectContaining({ position })
        )
      })
    })
  })
})