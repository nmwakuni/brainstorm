import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db, employees, advances, employers } from '@salary-advance/database'
import { requireAuth, AuthContext } from '../middleware/auth'
import { calculateAdvanceFee, canRequestAdvance } from '@salary-advance/lib'
import { eq, and, gte } from 'drizzle-orm'
import { getMpesaService } from '../services/mpesa'

const advancesRoute = new Hono<AuthContext>()

// All routes require auth
advancesRoute.use('*', requireAuth)

// ============================================================================
// REQUEST ADVANCE (Employee)
// ============================================================================

const requestAdvanceSchema = z.object({
  amount: z.number().positive(),
})

advancesRoute.post('/request', zValidator('json', requestAdvanceSchema), async c => {
  const userId = c.get('userId')
  const { amount } = c.req.valid('json')

  // Get employee
  const employee = await db.query.employees.findFirst({
    where: eq(employees.userId, userId),
  })

  if (!employee) {
    return c.json({ error: 'Employee not found' }, 404)
  }

  // Get employer settings
  const employer = await db.query.employers.findFirst({
    where: eq(employers.id, employee.employerId),
  })

  if (!employer) {
    return c.json({ error: 'Employer not found' }, 404)
  }

  // Calculate earned to date (simplified)
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dayOfMonth = today.getDate()
  const earnedToDate = (parseFloat(employee.monthlySalary) / daysInMonth) * dayOfMonth

  // Get advances this month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const advancesThisMonth = await db.query.advances.findMany({
    where: and(
      eq(advances.employeeId, employee.id),
      gte(advances.requestedAt, firstDayOfMonth)
    ),
  })

  const activeAdvances = advancesThisMonth.filter(
    a => a.status !== 'cancelled' && a.status !== 'failed'
  )

  const totalAdvancedThisMonth = activeAdvances.reduce(
    (sum, a) => sum + parseFloat(a.totalAmount),
    0
  )

  // Check if can request
  const { canRequest, reason } = canRequestAdvance(
    activeAdvances.length,
    employer.settings!.maxAdvancesPerMonth,
    earnedToDate,
    totalAdvancedThisMonth,
    employer.settings!.maxAdvancePercentage
  )

  if (!canRequest) {
    return c.json({ error: reason }, 400)
  }

  // Check if amount exceeds available
  const maxAdvance = (earnedToDate * employer.settings!.maxAdvancePercentage) / 100
  const available = maxAdvance - totalAdvancedThisMonth

  if (amount > available) {
    return c.json(
      {
        error: `Amount exceeds available balance. You can withdraw up to ${available.toFixed(2)}`,
      },
      400
    )
  }

  // Calculate fee
  const fee = calculateAdvanceFee(
    amount,
    employer.settings!.feePercentage,
    employer.settings!.flatFee
  )
  const totalAmount = amount + fee

  // Create advance
  const [newAdvance] = await db
    .insert(advances)
    .values({
      employeeId: employee.id,
      employerId: employee.employerId,
      payrollPeriodId: 'current', // TODO: Get actual payroll period
      amount: amount.toString(),
      fee: fee.toString(),
      totalAmount: totalAmount.toString(),
      status: employer.settings!.autoApproveAdvances ? 'approved' : 'pending',
      approvedAt: employer.settings!.autoApproveAdvances ? new Date() : undefined,
    })
    .returning()

  // If auto-approved, trigger M-Pesa disbursement
  if (employer.settings!.autoApproveAdvances && process.env.MPESA_ENABLED === 'true') {
    try {
      const mpesa = getMpesaService()
      const result = await mpesa.sendMoney({
        amount: amount,
        phoneNumber: employee.mpesaNumber,
        remarks: `Salary advance for ${employee.firstName} ${employee.lastName}`,
        occasionReference: newAdvance.id,
      })

      // Store M-Pesa conversation ID for webhook matching
      await db
        .update(advances)
        .set({
          mpesaConversationId: result.OriginatorConversationID,
        })
        .where(eq(advances.id, newAdvance.id))

      console.log(`✓ M-Pesa disbursement initiated for advance ${newAdvance.id}`)
    } catch (error: any) {
      // Mark as failed if M-Pesa request fails
      await db
        .update(advances)
        .set({
          status: 'failed',
          failureReason: error.message || 'M-Pesa disbursement failed',
          failedAt: new Date(),
        })
        .where(eq(advances.id, newAdvance.id))

      return c.json({
        error: 'Failed to process M-Pesa payment. Please try again later.',
      }, 500)
    }
  }

  return c.json({
    success: true,
    advance: newAdvance,
    message: employer.settings!.autoApproveAdvances
      ? 'Advance approved! Money will be sent to your M-Pesa shortly.'
      : 'Advance request submitted for approval.',
  })
})

// ============================================================================
// GET ADVANCE DETAILS
// ============================================================================

advancesRoute.get('/:id', async c => {
  const id = c.req.param('id')
  const userId = c.get('userId')

  const advance = await db.query.advances.findFirst({
    where: eq(advances.id, id),
    with: {
      employee: true,
    },
  })

  if (!advance) {
    return c.json({ error: 'Advance not found' }, 404)
  }

  // Verify user has access to this advance
  if (advance.employee.userId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  return c.json({
    success: true,
    advance,
  })
})

export default advancesRoute
