/**
 * Calculate how much an employee has earned so far in a pay period
 */
export function calculateEarnedToDate(
  monthlySalary: number,
  daysWorked: number,
  totalWorkDaysInMonth: number
): number {
  return (monthlySalary / totalWorkDaysInMonth) * daysWorked
}

/**
 * Calculate the maximum advance amount an employee can request
 */
export function calculateMaxAdvance(earnedToDate: number, maxPercentage: number = 50): number {
  return (earnedToDate * maxPercentage) / 100
}

/**
 * Calculate the fee for an advance
 */
export function calculateAdvanceFee(
  amount: number,
  feePercentage: number,
  flatFee: number = 0
): number {
  const percentageFee = (amount * feePercentage) / 100
  return percentageFee + flatFee
}

/**
 * Calculate net pay after deductions
 */
export function calculateNetPay(grossPay: number, deductions: number): number {
  return grossPay - deductions
}

/**
 * Check if employee can request another advance
 */
export function canRequestAdvance(
  advancesThisMonth: number,
  maxAdvancesPerMonth: number,
  earnedToDate: number,
  totalAdvancedThisMonth: number,
  maxPercentage: number
): {
  canRequest: boolean
  reason?: string
} {
  // Check advance count limit
  if (advancesThisMonth >= maxAdvancesPerMonth) {
    return {
      canRequest: false,
      reason: `You've reached the maximum of ${maxAdvancesPerMonth} advances per month`,
    }
  }

  // Check if already advanced maximum percentage
  const maxAdvanceAmount = calculateMaxAdvance(earnedToDate, maxPercentage)
  if (totalAdvancedThisMonth >= maxAdvanceAmount) {
    return {
      canRequest: false,
      reason: `You've already advanced the maximum amount (${maxPercentage}% of earned wages)`,
    }
  }

  return { canRequest: true }
}
