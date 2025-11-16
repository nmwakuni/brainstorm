import { Hono } from 'hono'
import { requireAuth, requireRole, AuthContext } from '../middleware/auth'

const payroll = new Hono<AuthContext>()

// All routes require employer auth
payroll.use('*', requireAuth)
payroll.use('*', requireRole('employer', 'admin'))

// ============================================================================
// UPLOAD PAYROLL DATA
// ============================================================================

payroll.post('/upload', async c => {
  // TODO: Implement payroll upload
  return c.json({ message: 'Payroll upload - TODO' })
})

// ============================================================================
// GET CURRENT PAYROLL PERIOD
// ============================================================================

payroll.get('/current', async c => {
  // TODO: Implement get current payroll period
  return c.json({ message: 'Get current payroll - TODO' })
})

// ============================================================================
// GENERATE DEDUCTION FILE
// ============================================================================

payroll.get('/deductions', async c => {
  // TODO: Generate CSV of deductions for this pay period
  return c.json({ message: 'Generate deductions file - TODO' })
})

export default payroll
