import { Hono } from 'hono'
import { db, employees, advances } from '@salary-advance/database'
import { requireAuth, requireRole, AuthContext } from '../middleware/auth'
import { eq } from 'drizzle-orm'

const employeesRoute = new Hono<AuthContext>()

// All routes require employee auth
employeesRoute.use('*', requireAuth)
employeesRoute.use('*', requireRole('employee'))

// ============================================================================
// GET EMPLOYEE DASHBOARD
// ============================================================================

employeesRoute.get('/dashboard', async c => {
  const userId = c.get('userId')

  // Get employee profile
  const employee = await db.query.employees.findFirst({
    where: eq(employees.userId, userId),
    with: {
      employer: true,
    },
  })

  if (!employee) {
    return c.json({ error: 'Employee not found' }, 404)
  }

  // Get current payroll period
  // TODO: Implement proper payroll period logic

  // Get advances for this month
  const employeeAdvances = await db.query.advances.findMany({
    where: eq(advances.employeeId, employee.id),
    orderBy: (advances, { desc }) => [desc(advances.requestedAt)],
    limit: 10,
  })

  // Calculate earned to date (simplified - assumes full month worked)
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dayOfMonth = today.getDate()
  const earnedToDate = (parseFloat(employee.monthlySalary) / daysInMonth) * dayOfMonth

  // Calculate total advanced this month
  const totalAdvancedThisMonth = employeeAdvances
    .filter(a => a.status !== 'cancelled' && a.status !== 'failed')
    .reduce((sum, a) => sum + parseFloat(a.totalAmount), 0)

  // Calculate available to withdraw (50% of earned - already advanced)
  const maxAdvance = earnedToDate * 0.5
  const availableToWithdraw = Math.max(0, maxAdvance - totalAdvancedThisMonth)

  return c.json({
    success: true,
    employee: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      monthlySalary: parseFloat(employee.monthlySalary),
    },
    earnings: {
      monthlySalary: parseFloat(employee.monthlySalary),
      earnedToDate,
      availableToWithdraw,
      totalAdvancedThisMonth,
    },
    recentAdvances: employeeAdvances,
  })
})

// ============================================================================
// GET ADVANCE HISTORY
// ============================================================================

employeesRoute.get('/advances', async c => {
  const userId = c.get('userId')

  // Get employee
  const employee = await db.query.employees.findFirst({
    where: eq(employees.userId, userId),
  })

  if (!employee) {
    return c.json({ error: 'Employee not found' }, 404)
  }

  // Get all advances
  const allAdvances = await db.query.advances.findMany({
    where: eq(advances.employeeId, employee.id),
    orderBy: (advances, { desc }) => [desc(advances.requestedAt)],
  })

  return c.json({
    success: true,
    advances: allAdvances,
  })
})

export default employeesRoute
