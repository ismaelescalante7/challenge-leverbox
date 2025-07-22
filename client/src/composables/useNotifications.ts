import { useToast } from 'vue-toastification'

export interface NotificationOptions {
  title?: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function useNotifications() {
  const toast = useToast()

  const showSuccess = (message: string, options: NotificationOptions = {}) => {
    toast.success(message, {
      timeout: options.duration || 3000,
      position: options.position || 'top-right',
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: true
    })
  }

  const showError = (message: string, options: NotificationOptions = {}) => {
    toast.error(message, {
      timeout: options.duration || 5000,
      position: options.position || 'top-right',
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: true
    })
  }

  const showWarning = (message: string, options: NotificationOptions = {}) => {
    toast.warning(message, {
      timeout: options.duration || 4000,
      position: options.position || 'top-right',
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: true
    })
  }

  const showInfo = (message: string, options: NotificationOptions = {}) => {
    toast.info(message, {
      timeout: options.duration || 3000,
      position: options.position || 'top-right',
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: true
    })
  }

  const showLoading = (message: string = 'Loading...') => {
    return toast.info(message, {
      timeout: false, // No auto-dismiss
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      hideProgressBar: true,
      icon: '⏳'
    })
  }

  const dismiss = (toastId?: any) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.clear()
    }
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismiss
  }
}