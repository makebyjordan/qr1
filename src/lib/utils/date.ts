import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: es })
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es })
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return `Hoy ${format(dateObj, 'HH:mm', { locale: es })}`
  }
  
  if (isYesterday(dateObj)) {
    return `Ayer ${format(dateObj, 'HH:mm', { locale: es })}`
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
}
