import {
  calculateEarnedToDate,
  calculateMaxAdvance,
  calculateAdvanceFee,
  calculateNetPay,
  canRequestAdvance,
} from '../calculations'

describe('Salary Calculation Functions', () => {
  describe('calculateEarnedToDate', () => {
    it('should calculate earned wages correctly for half month worked', () => {
      const monthlySalary = 60000
      const daysWorked = 15
      const totalWorkDaysInMonth = 30

      const earned = calculateEarnedToDate(monthlySalary, daysWorked, totalWorkDaysInMonth)

      expect(earned).toBe(30000)
    })

    it('should calculate earned wages for first day of work', () => {
      const monthlySalary = 30000
      const daysWorked = 1
      const totalWorkDaysInMonth = 30

      const earned = calculateEarnedToDate(monthlySalary, daysWorked, totalWorkDaysInMonth)

      expect(earned).toBe(1000)
    })

    it('should calculate earned wages for full month', () => {
      const monthlySalary = 45000
      const daysWorked = 22
      const totalWorkDaysInMonth = 22

      const earned = calculateEarnedToDate(monthlySalary, daysWorked, totalWorkDaysInMonth)

      expect(earned).toBe(45000)
    })
  })

  describe('calculateMaxAdvance', () => {
    it('should calculate 50% of earned wages by default', () => {
      const earnedToDate = 20000

      const maxAdvance = calculateMaxAdvance(earnedToDate)

      expect(maxAdvance).toBe(10000)
    })

    it('should calculate custom percentage when specified', () => {
      const earnedToDate = 30000
      const maxPercentage = 75

      const maxAdvance = calculateMaxAdvance(earnedToDate, maxPercentage)

      expect(maxAdvance).toBe(22500)
    })

    it('should handle zero earned wages', () => {
      const earnedToDate = 0

      const maxAdvance = calculateMaxAdvance(earnedToDate)

      expect(maxAdvance).toBe(0)
    })
  })

  describe('calculateAdvanceFee', () => {
    it('should calculate percentage fee only', () => {
      const amount = 10000
      const feePercentage = 4

      const fee = calculateAdvanceFee(amount, feePercentage)

      expect(fee).toBe(400)
    })

    it('should calculate percentage fee plus flat fee', () => {
      const amount = 10000
      const feePercentage = 4
      const flatFee = 50

      const fee = calculateAdvanceFee(amount, feePercentage, flatFee)

      expect(fee).toBe(450)
    })

    it('should handle zero percentage fee', () => {
      const amount = 10000
      const feePercentage = 0
      const flatFee = 100

      const fee = calculateAdvanceFee(amount, feePercentage, flatFee)

      expect(fee).toBe(100)
    })
  })

  describe('calculateNetPay', () => {
    it('should calculate net pay correctly', () => {
      const grossPay = 50000
      const deductions = 5000

      const netPay = calculateNetPay(grossPay, deductions)

      expect(netPay).toBe(45000)
    })

    it('should handle zero deductions', () => {
      const grossPay = 30000
      const deductions = 0

      const netPay = calculateNetPay(grossPay, deductions)

      expect(netPay).toBe(30000)
    })

    it('should handle full salary deduction', () => {
      const grossPay = 20000
      const deductions = 20000

      const netPay = calculateNetPay(grossPay, deductions)

      expect(netPay).toBe(0)
    })
  })

  describe('canRequestAdvance', () => {
    it('should allow advance when under all limits', () => {
      const result = canRequestAdvance(
        2, // advancesThisMonth
        4, // maxAdvancesPerMonth
        20000, // earnedToDate
        5000, // totalAdvancedThisMonth
        50 // maxPercentage
      )

      expect(result.canRequest).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should deny advance when max count reached', () => {
      const result = canRequestAdvance(
        4, // advancesThisMonth (reached limit)
        4, // maxAdvancesPerMonth
        20000, // earnedToDate
        5000, // totalAdvancedThisMonth
        50 // maxPercentage
      )

      expect(result.canRequest).toBe(false)
      expect(result.reason).toContain("You've reached the maximum of 4 advances per month")
    })

    it('should deny advance when max amount reached', () => {
      const result = canRequestAdvance(
        2, // advancesThisMonth
        4, // maxAdvancesPerMonth
        20000, // earnedToDate
        10000, // totalAdvancedThisMonth (50% of 20000)
        50 // maxPercentage
      )

      expect(result.canRequest).toBe(false)
      expect(result.reason).toContain(
        "You've already advanced the maximum amount (50% of earned wages)"
      )
    })

    it('should deny advance when exceeded max amount', () => {
      const result = canRequestAdvance(
        1, // advancesThisMonth
        4, // maxAdvancesPerMonth
        20000, // earnedToDate
        12000, // totalAdvancedThisMonth (60% of 20000, over 50% limit)
        50 // maxPercentage
      )

      expect(result.canRequest).toBe(false)
      expect(result.reason).toBeDefined()
    })

    it('should work with custom max percentage', () => {
      const result = canRequestAdvance(
        1, // advancesThisMonth
        4, // maxAdvancesPerMonth
        20000, // earnedToDate
        12000, // totalAdvancedThisMonth
        75 // maxPercentage (allowing 75% instead of 50%)
      )

      expect(result.canRequest).toBe(true)
      expect(result.reason).toBeUndefined()
    })
  })
})
