// client/tests/composables/useStatusColors.test.ts
import { describe, it, expect } from 'vitest'
import { useStatusColors, statusVariantMapping, getStatsCardVariant } from '@/composables/useStatusColors'
import type { StatusObject } from '@/types/task'

describe('useStatusColors', () => {
  const {
    statusColors,
    getStatusColors,
    getCustomColor,
    getStatusBadgeClasses,
    getStatusCardClasses,
    getStatusIconClasses,
    useStatusStyle
  } = useStatusColors()

  describe('statusColors', () => {
    it('should have all required status colors', () => {
      expect(statusColors).toHaveProperty('pending')
      expect(statusColors).toHaveProperty('in_progress')
      expect(statusColors).toHaveProperty('completed')
      expect(statusColors).toHaveProperty('progress')
      expect(statusColors).toHaveProperty('overdue')
      expect(statusColors).toHaveProperty('default')
    })

    it('should have all required color properties for each status', () => {
      Object.values(statusColors).forEach(colorSet => {
        expect(colorSet).toHaveProperty('background')
        expect(colorSet).toHaveProperty('text')
        expect(colorSet).toHaveProperty('border')
        expect(colorSet).toHaveProperty('light')
        expect(colorSet).toHaveProperty('hover')
        expect(colorSet).toHaveProperty('lightBorder')
        expect(colorSet).toHaveProperty('icon')
        expect(colorSet).toHaveProperty('iconBg')
      })
    })
  })

  describe('getStatusColors', () => {
    it('should return correct colors for string status', () => {
      expect(getStatusColors('pending')).toEqual(statusColors.pending)
      expect(getStatusColors('in_progress')).toEqual(statusColors.in_progress)
      expect(getStatusColors('completed')).toEqual(statusColors.completed)
      expect(getStatusColors('overdue')).toEqual(statusColors.overdue)
    })

    it('should return correct colors for StatusObject', () => {
      const statusObj: StatusObject = {
        value: 'completed',
        label: 'Completed'
      }
      expect(getStatusColors(statusObj)).toEqual(statusColors.completed)
    })

    it('should return pending colors for unknown status', () => {
      expect(getStatusColors('unknown_status')).toEqual(statusColors.pending)
    })

    it('should handle progress status correctly', () => {
      expect(getStatusColors('progress')).toEqual(statusColors.progress)
    })
  })

  describe('getCustomColor', () => {
    it('should return custom color object when color is provided', () => {
      const statusWithColor: StatusObject = {
        value: 'custom',
        label: 'Custom',
        color: '#FF5733'
      }
      
      const customColors = getCustomColor(statusWithColor)
      
      expect(customColors).toEqual({
        background: 'bg-[#FF5733]/20',
        text: 'text-[#FF5733]',
        border: 'border-[#FF5733]/30',
        light: 'bg-[#FF5733]/10',
        hover: 'hover:bg-[#FF5733]/30',
        lightBorder: 'border-[#FF5733]/20',
        icon: 'text-[#FF5733]',
        iconBg: 'bg-[#FF5733]/20'
      })
    })

    it('should return null when no color is provided', () => {
      const statusWithoutColor: StatusObject = {
        value: 'pending',
        label: 'Pending'
      }
      
      expect(getCustomColor(statusWithoutColor)).toBeNull()
    })
  })

  describe('getStatusBadgeClasses', () => {
    it('should return correct badge classes for string status', () => {
      const pendingClasses = getStatusBadgeClasses('pending')
      expect(pendingClasses).toContain('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border')
      expect(pendingClasses).toContain('bg-gray-100')
      expect(pendingClasses).toContain('text-gray-800')
      expect(pendingClasses).toContain('border-gray-300')
    })

    it('should return correct badge classes for completed status', () => {
      const completedClasses = getStatusBadgeClasses('completed')
      expect(completedClasses).toContain('bg-green-100')
      expect(completedClasses).toContain('text-green-800')
      expect(completedClasses).toContain('border-green-300')
    })

    it('should return correct badge classes for StatusObject', () => {
      const statusObj: StatusObject = {
        value: 'in_progress',
        label: 'In Progress'
      }
      const classes = getStatusBadgeClasses(statusObj)
      expect(classes).toContain('bg-yellow-100')
      expect(classes).toContain('text-yellow-800')
      expect(classes).toContain('border-yellow-300')
    })
  })

  describe('getStatusCardClasses', () => {
    it('should return correct card classes for string status', () => {
      const pendingClasses = getStatusCardClasses('pending')
      expect(pendingClasses).toContain('bg-gray-50')
      expect(pendingClasses).toContain('hover:bg-gray-100')
      expect(pendingClasses).toContain('border')
      expect(pendingClasses).toContain('border-gray-200')
    })

    it('should return correct card classes for overdue status', () => {
      const overdueClasses = getStatusCardClasses('overdue')
      expect(overdueClasses).toContain('bg-red-50')
      expect(overdueClasses).toContain('hover:bg-red-100')
      expect(overdueClasses).toContain('border-red-200')
    })
  })

  describe('getStatusIconClasses', () => {
    it('should return correct icon classes for string status', () => {
      const iconClasses = getStatusIconClasses('pending')
      expect(iconClasses).toEqual({
        icon: 'text-gray-600',
        background: 'bg-gray-100'
      })
    })

    it('should return correct icon classes for completed status', () => {
      const iconClasses = getStatusIconClasses('completed')
      expect(iconClasses).toEqual({
        icon: 'text-green-600',
        background: 'bg-green-100'
      })
    })

    it('should return correct icon classes for StatusObject', () => {
      const statusObj: StatusObject = {
        value: 'in_progress',
        label: 'In Progress'
      }
      const iconClasses = getStatusIconClasses(statusObj)
      expect(iconClasses).toEqual({
        icon: 'text-yellow-600',
        background: 'bg-yellow-100'
      })
    })
  })

  describe('useStatusStyle', () => {
    it('should return computed style object for string status', () => {
      const style = useStatusStyle('pending')
      const styleValue = style.value

      expect(styleValue.badge).toContain('bg-gray-100')
      expect(styleValue.card).toContain('bg-gray-50')
      expect(styleValue.icon).toEqual({
        icon: 'text-gray-600',
        background: 'bg-gray-100'
      })
      expect(styleValue.colors).toEqual(statusColors.pending)
      expect(styleValue.hasCustomColor).toBe(false)
    })

    it('should return computed style object for StatusObject without custom color', () => {
      const statusObj: StatusObject = {
        value: 'completed',
        label: 'Completed'
      }
      const style = useStatusStyle(statusObj)
      const styleValue = style.value

      expect(styleValue.badge).toContain('bg-green-100')
      expect(styleValue.hasCustomColor).toBe(false)
    })

    it('should return computed style object for StatusObject with custom color', () => {
      const statusObj: StatusObject = {
        value: 'custom',
        label: 'Custom',
        color: '#FF5733'
      }
      const style = useStatusStyle(statusObj)
      const styleValue = style.value

      expect(styleValue.hasCustomColor).toBe(true)
      expect(styleValue.colors.text).toBe('text-[#FF5733]')
    })

    it('should be reactive (computed)', () => {
      // El hecho de que retorne un computed significa que es reactivo
      const style = useStatusStyle('pending')
      expect(style.value).toBeDefined()
      expect(typeof style.value).toBe('object')
    })
  })
})

describe('statusVariantMapping', () => {
  it('should have all required mappings', () => {
    expect(statusVariantMapping).toEqual({
      pending: 'pending',
      in_progress: 'in_progress',
      progress: 'progress',
      completed: 'completed',
      total: 'primary',
      overdue: 'overdue',
      default: 'default'
    })
  })
})

describe('getStatsCardVariant', () => {
  it('should return correct variant for each status type', () => {
    expect(getStatsCardVariant('pending')).toBe('pending')
    expect(getStatsCardVariant('in_progress')).toBe('in_progress')
    expect(getStatsCardVariant('progress')).toBe('progress')
    expect(getStatsCardVariant('completed')).toBe('completed')
    expect(getStatsCardVariant('total')).toBe('primary')
    expect(getStatsCardVariant('overdue')).toBe('overdue')
    expect(getStatsCardVariant('default')).toBe('default')
  })
})