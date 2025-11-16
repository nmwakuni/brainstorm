import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db, employees, users } from '@salary-advance/database'
import { requireAuth, requireRole, AuthContext } from '../middleware/auth'
import { hashPin, formatPhoneNumber } from '@salary-advance/lib'
import { eq } from 'drizzle-orm'

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
    where: eq(db.schema.employers.userId, userId),
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
    where: eq(db.schema.employers.userId, userId),
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
    where: eq(db.schema.employers.userId, userId),
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

export default employers
