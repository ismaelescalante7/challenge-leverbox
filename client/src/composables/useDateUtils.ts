import { format, parseISO, isAfter, isBefore, differenceInDays, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns'

export function useDateUtils() {
  /**
   * Format date for display
   */
  const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, formatStr)
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Format date and time
   */
  const formatDateTime = (date: string | Date): string => {
    return formatDate(date, 'MMM dd, yyyy HH:mm')
  }

  /**
   * Format date for HTML input (YYYY-MM-DD)
   */
  const formatDateForInput = (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, 'yyyy-MM-dd')
    } catch {
      return ''
    }
  }

  /**
   * Get relative date description
   */
  const getRelativeDate = (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      
      if (isToday(dateObj)) return 'Today'
      if (isTomorrow(dateObj)) return 'Tomorrow'
      if (isYesterday(dateObj)) return 'Yesterday'
      
      const days = differenceInDays(dateObj, new Date())
      
      if (days > 0) {
        return days === 1 ? 'In 1 day' : `In ${days} days`
      } else {
        return Math.abs(days) === 1 ? '1 day ago' : `${Math.abs(days)} days ago`
      }
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Get human-readable time distance
   */
  const getTimeAgo = (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Check if date is overdue
   */
  const isOverdue = (dueDate: string | Date | null): boolean => {
    if (!dueDate) return false
    
    try {
      const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      return isBefore(dateObj, today)
    } catch {
      return false
    }
  }

  /**
   * Check if date is due soon (within next 3 days)
   */
  const isDueSoon = (dueDate: string | Date | null): boolean => {
    if (!dueDate) return false
    
    try {
      const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      threeDaysFromNow.setHours(23, 59, 59, 999)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      return isAfter(dateObj, today) && isBefore(dateObj, threeDaysFromNow)
    } catch {
      return false
    }
  }

  /**
   * Check if date is due today
   */
  const isDueToday = (dueDate: string | Date | null): boolean => {
    if (!dueDate) return false
    
    try {
      const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
      return isToday(dateObj)
    } catch {
      return false
    }
  }

  /**
   * Get current date in ISO format
   */
  const getCurrentISODate = (): string => {
    return new Date().toISOString()
  }

  /**
   * Get current date for input field
   */
  const getTodayForInput = (): string => {
    return format(new Date(), 'yyyy-MM-dd')
  }

  /**
   * Parse date from input field
   */
  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString) return null
    
    try {
      // Input format is YYYY-MM-DD, parse as local date
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day) // month is 0-indexed
    } catch {
      return null
    }
  }

  /**
   * Get date status for styling
   */
  const getDateStatus = (dueDate: string | Date | null): 'overdue' | 'due-today' | 'due-soon' | 'normal' => {
    if (isOverdue(dueDate)) return 'overdue'
    if (isDueToday(dueDate)) return 'due-today'
    if (isDueSoon(dueDate)) return 'due-soon'
    return 'normal'
  }

  /**
   * Get CSS classes for date status
   */
  const getDateStatusClasses = (dueDate: string | Date | null): string => {
    const status = getDateStatus(dueDate)
    const classes: Record<string, string> = {
      'overdue': 'text-red-600 font-medium',
      'due-today': 'text-orange-600 font-medium',
      'due-soon': 'text-yellow-600',
      'normal': 'text-gray-900'
    }
    return classes[status] || classes.normal
  }

  /**
   * Format duration between two dates
   */
  const formatDuration = (startDate: string | Date, endDate: string | Date): string => {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
      const days = differenceInDays(end, start)
      
      if (days === 0) return 'Same day'
      if (days === 1) return '1 day'
      return `${days} days`
    } catch {
      return 'Invalid duration'
    }
  }

  return {
    formatDate,
    formatDateTime,
    formatDateForInput,
    getRelativeDate,
    getTimeAgo,
    isOverdue,
    isDueSoon,
    isDueToday,
    getCurrentISODate,
    getTodayForInput,
    parseDateFromInput,
    getDateStatus,
    getDateStatusClasses,
    formatDuration
  }
}