import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
  db,
  employees,
  users,
  advances,
  employers as employersTable,
} from '@salary-advance/database'
import { requireAuth, requireRole, AuthContext } from '../middleware/auth'
import { hashPin, formatPhoneNumber } from '@salary-advance/lib'
import { eq, and, desc } from 'drizzle-orm'
import { getMpesaService } from '../services/mpesa'

const employers = new Hono<AuthContext>()

// All routes require employer auth
employers.use('*', requireAuth)
employers.use('*', requireRole('employer', 'admin'))

// ============================================================================
// GET EMPLOYER DASHBOARD STATS
// ============================================================================

employers.get('/dashboard', async c => {
  const userId = c.get('userId')

  // Get employer
  const employer = await db.query.employers.findFirst({
    where: eq(employersTable.userId, userId),
  })

  if (!employer) {
    return c.json({ error: 'Employer not found' }, 404)
  }

  // Get stats (simplified for MVP)
  const allEmployees = await db.query.employees.findMany({
    where: eq(employees.employerId, employer.id),
  })

  const activeEmployees = allEmployees.filter(e => e.isActive)

  // TODO: Add advances stats, usage stats, etc.

  return c.json({
    success: true,
    stats: {
      totalEmployees: allEmployees.length,
      activeEmployees: activeEmployees.length,
      totalAdvancesThisMonth: 0, // TODO
      totalAmountAdvanced: 0, // TODO
    },
  })
})

// ============================================================================
// CREATE EMPLOYEE
// ============================================================================

const createEmployeeSchema = z.object({
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  mpesaNumber: z.string(),
  monthlySalary: z.number().positive(),
  hireDate: z.string().or(z.date()),
})

employers.post('/employees', zValidator('json', createEmployeeSchema), async c => {
  const userId = c.get('userId')
  const data = c.req.valid('json')

  // Get employer
  const employer = await db.query.employers.findFirst({
    where: eq(employersTable.userId, userId),
  })

  if (!employer) {
    return c.json({ error: 'Employer not found' }, 404)
  }

  // Check if employee number already exists for this employer
  const existing = await db.query.employees.findFirst({
    where: eq(employees.employeeNumber, data.employeeNumber),
  })

  if (existing && existing.employerId === employer.id) {
    return c.json({ error: 'Employee number already exists' }, 400)
  }

  // Format phone numbers
  const phoneNumber = formatPhoneNumber(data.phoneNumber)
  const mpesaNumber = formatPhoneNumber(data.mpesaNumber)

  // Check if user exists with this phone number
  let user = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  })

  // If not, create user account (they'll set PIN on first login)
  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        phoneNumber,
        role: 'employee',
        pin: await hashPin('0000'), // Default PIN, user will change on first login
      })
      .returning()
    user = newUser
  }

  // Create employee profile
  const [employee] = await db
    .insert(employees)
    .values({
      userId: user.id,
      employerId: employer.id,
      employeeNumber: data.employeeNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber,
      mpesaNumber,
      monthlySalary: data.monthlySalary.toString(),
      hireDate: new Date(data.hireDate),
    })
    .returning()

  return c.json({
    success: true,
    employee,
  })
})

// ============================================================================
// GET ALL EMPLOYEES
// ============================================================================

employers.get('/employees', async c => {
  const userId = c.get('userId')

  // Get employer
  const employer = await db.query.employers.findFirst({
    where: eq(employersTable.userId, userId),
  })

  if (!employer) {
    return c.json({ error: 'Employer not found' }, 404)
  }

  // Get all employees
  const allEmployees = await db.query.employees.findMany({
    where: eq(employees.employerId, employer.id),
  })

  return c.json({
    success: true,
    employees: allEmployees,
  })
})

// ============================================================================
// BULK UPLOAD EMPLOYEES (CSV)
// ============================================================================

employers.post('/employees/bulk', async c => {
  // TODO: Implement CSV parsing and bulk insert
  return c.json({ message: 'Bulk upload - TODO' })
})

// ============================================================================
// GET ALL ADVANCES
// ============================================================================

employers.get('/advances', async c => {
  const userId = c.get('userId')
  const status = c.req.query('status')

  // Get employer
  const employer = await db.query.employers.findFirst({
    where: eq(employersTable.userId, userId),
  })

  if (!employer) {
    return c.json({ error: 'Employer not found' }, 404)
  }

  // Get advances for this employer
  const allAdvances = await db.query.advances.findMany({
    where: status
      ? and(eq(advances.employerId, employer.id), eq(advances.status, status as any))
      : eq(advances.employerId, employer.id),
    with: {
      employee: true,
    },
    orderBy: [desc(advances.requestedAt)],
  })

  return c.json({
    success: true,
    advances: allAdvances,
  })
})

// ============================================================================
// UPDATE ADVANCE STATUS (Approve/Reject)
// ============================================================================

const updateAdvanceStatusSchema = z.object({
  status: z.enum(['approved', 'cancelled']),
  reason: z.string().optional(),
})

employers.patch('/advances/:id', zValidator('json', updateAdvanceStatusSchema), async c => {
  const userId = c.get('userId')
  const advanceId = c.req.param('id')
  const { status, reason } = c.req.valid('json')

  // Get employer
  const employer = await db.query.employers.findFirst({
    where: eq(employersTable.userId, userId),
  })

  if (!employer) {
    return c.json({ error: 'Employer not found' }, 404)
  }

  // Get advance
  const advance = await db.query.advances.findFirst({
    where: eq(advances.id, advanceId),
    with: {
      employee: true,
    },
  })

  if (!advance) {
    return c.json({ error: 'Advance not found' }, 404)
  }

  // Verify this advance belongs to the employer
  if (advance.employerId !== employer.id) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  // Can only update pending advances
  if (advance.status !== 'pending') {
    return c.json({ error: `Cannot update advance with status: ${advance.status}` }, 400)
  }

  if (status === 'approved') {
    // Update to approved
    await db
      .update(advances)
      .set({
        status: 'approved',
        approvedAt: new Date(),
      })
      .where(eq(advances.id, advanceId))

    // Trigger M-Pesa disbursement
    if (process.env.MPESA_ENABLED === 'true') {
      try {
        const mpesa = getMpesaService()
        const employee = advance.employee as any
        const result = await mpesa.sendMoney({
          amount: parseFloat(advance.amount),
          phoneNumber: employee.mpesaNumber,
          remarks: `Salary advance for ${employee.firstName} ${employee.lastName}`,
          occasionReference: advance.id,
        })

        // Store M-Pesa conversation ID
        await db
          .update(advances)
          .set({
            mpesaConversationId: result.OriginatorConversationID,
          })
          .where(eq(advances.id, advanceId))

        console.log(`✓ M-Pesa disbursement initiated for advance ${advanceId}`)

        return c.json({
          success: true,
          message: 'Advance approved and M-Pesa payment initiated',
        })
      } catch (error: any) {
        // Mark as failed
        await db
          .update(advances)
          .set({
            status: 'failed',
            failureReason: error.message || 'M-Pesa disbursement failed',
            failedAt: new Date(),
          })
          .where(eq(advances.id, advanceId))

        return c.json(
          {
            error: 'Advance approved but M-Pesa payment failed',
            details: error.message,
          },
          500
        )
      }
    }

    return c.json({
      success: true,
      message: 'Advance approved (M-Pesa disabled)',
    })
  } else {
    // Cancelled/Rejected
    await db
      .update(advances)
      .set({
        status: 'cancelled',
        failureReason: reason || 'Rejected by employer',
      })
      .where(eq(advances.id, advanceId))

    return c.json({
      success: true,
      message: 'Advance rejected',
    })
  }
})

export default employers
