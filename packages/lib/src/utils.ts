import { createId } from '@paralleldrive/cuid2'

export { createId }

export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Format for Kenyan numbers (254...)
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`
  }

  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.slice(1)}`
  }

  // Otherwise assume it's already without country code
  return `+254${cleaned}`
}

export function calculateWorkDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      // Not Sunday or Saturday
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}
