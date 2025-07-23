import { computed } from 'vue'
import type { StatusObject } from '@/types/task'

/**
 * Composable para mantener colores consistentes de status en toda la aplicación
 */
export function useStatusColors() {
  
  // Colores base del sistema de status - ACTUALIZADOS
  const statusColors = {
    pending: {
      background: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      light: 'bg-gray-50',
      hover: 'hover:bg-gray-100',
      lightBorder: 'border-gray-200',
      icon: 'text-gray-600',
      iconBg: 'bg-gray-100'
    },
    in_progress: {
      background: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      light: 'bg-yellow-50',
      hover: 'hover:bg-yellow-100',
      lightBorder: 'border-yellow-200',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    completed: {
      background: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      light: 'bg-green-50',
      hover: 'hover:bg-green-100',
      lightBorder: 'border-green-200',
      icon: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    // Agregar mapeos para variantes del TaskList
    progress: {
      background: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      light: 'bg-yellow-50',
      hover: 'hover:bg-yellow-100',
      lightBorder: 'border-yellow-200',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    overdue: {
      background: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      light: 'bg-red-50',
      hover: 'hover:bg-red-100',
      lightBorder: 'border-red-200',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    default: {
      background: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      light: 'bg-gray-50',
      hover: 'hover:bg-gray-100',
      lightBorder: 'border-gray-200',
      icon: 'text-gray-600',
      iconBg: 'bg-gray-100'
    }
  } as const

  // Función para obtener colores por status
  const getStatusColors = (status: string | StatusObject) => {
    const statusValue = typeof status === 'string' ? status : status.value
    return statusColors[statusValue as keyof typeof statusColors] || statusColors.pending
  }

  // Función para obtener color personalizado si existe
  const getCustomColor = (status: StatusObject) => {
    if (status.color) {
      return {
        background: `bg-[${status.color}]/20`,
        text: `text-[${status.color}]`,
        border: `border-[${status.color}]/30`,
        light: `bg-[${status.color}]/10`,
        hover: `hover:bg-[${status.color}]/30`,
        lightBorder: `border-[${status.color}]/20`,
        icon: `text-[${status.color}]`,
        iconBg: `bg-[${status.color}]/20`
      }
    }
    return null
  }

  // Clases CSS para badges
  const getStatusBadgeClasses = (status: string | StatusObject) => {
    const colors = getStatusColors(status)
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.background} ${colors.text} ${colors.border}`
  }

  // Clases CSS para cards/containers
  const getStatusCardClasses = (status: string | StatusObject) => {
    const colors = getStatusColors(status)
    return `${colors.light} ${colors.hover} border ${colors.lightBorder}`
  }

  // Clases CSS para iconos
  const getStatusIconClasses = (status: string | StatusObject) => {
    const colors = getStatusColors(status)
    return {
      icon: colors.icon,
      background: colors.iconBg
    }
  }

  // Composable para uso en componentes
  const useStatusStyle = (status: string | StatusObject) => {
    return computed(() => {
      const colors = getStatusColors(status)
      const custom = typeof status === 'object' ? getCustomColor(status) : null
      
      return {
        badge: getStatusBadgeClasses(status),
        card: getStatusCardClasses(status),
        icon: getStatusIconClasses(status),
        colors: custom || colors,
        hasCustomColor: !!custom
      }
    })
  }

  return {
    statusColors,
    getStatusColors,
    getCustomColor,
    getStatusBadgeClasses,
    getStatusCardClasses,
    getStatusIconClasses,
    useStatusStyle
  }
}

// Mapeo de variantes para StatsCard - ACTUALIZADO
export const statusVariantMapping = {
  pending: 'pending',
  in_progress: 'in_progress', 
  progress: 'progress', // Agregar mapeo para TaskList
  completed: 'completed',
  total: 'primary',
  overdue: 'overdue',
  default: 'default'
} as const

// Función helper para convertir status a variante de StatsCard
export function getStatsCardVariant(statusType: keyof typeof statusVariantMapping) {
  return statusVariantMapping[statusType]
}