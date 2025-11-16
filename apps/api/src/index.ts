import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import 'dotenv/config'

import authRoutes from './routes/auth'
import employerRoutes from './routes/employers'
import employeeRoutes from './routes/employees'
import advanceRoutes from './routes/advances'
import payrollRoutes from './routes/payroll'
import mpesaRoutes from './routes/mpesa'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8081'], // Web app + Expo
    credentials: true,
  })
)

// Health check
app.get('/', c => {
  return c.json({
    message: 'Salary Advance API',
    version: '0.1.0',
    status: 'healthy',
  })
})

// Routes
app.route('/auth', authRoutes)
app.route('/employers', employerRoutes)
app.route('/employees', employeeRoutes)
app.route('/advances', advanceRoutes)
app.route('/payroll', payrollRoutes)
app.route('/mpesa', mpesaRoutes)

// 404 handler
app.notFound(c => {
  return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: err.message || 'Internal Server Error' }, 500)
})

const port = parseInt(process.env.PORT || '3001')

console.log(`🚀 Server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
