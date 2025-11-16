import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db, users, employers, employees } from '@salary-advance/database'
import { hashPin, verifyPin, generateToken } from '@salary-advance/lib'
import { eq } from 'drizzle-orm'

const auth = new Hono()

// ============================================================================
// REGISTER EMPLOYEE (via phone + employer code)
// ============================================================================

const registerEmployeeSchema = z.object({
  phoneNumber: z.string(),
  pin: z.string().length(4),
  employerCode: z.string(), // Will be provided by employer
})

auth.post('/register/employee', zValidator('json', registerEmployeeSchema), async c => {
  const { phoneNumber, pin, employerCode: _employerCode } = c.req.valid('json')

  // TODO: Verify employer code exists and map to employer
  // For now, we'll skip this and handle it in employer onboarding

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  })

  if (existingUser) {
    return c.json({ error: 'User already exists with this phone number' }, 400)
  }

  // Hash PIN
  const hashedPin = await hashPin(pin)

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      phoneNumber,
      pin: hashedPin,
      role: 'employee',
    })
    .returning()

  // Generate token
  const token = generateToken({ userId: newUser.id, role: newUser.role })

  return c.json({
    success: true,
    token,
    user: {
      id: newUser.id,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
    },
  })
})

// ============================================================================
// REGISTER EMPLOYER
// ============================================================================

const registerEmployerSchema = z.object({
  phoneNumber: z.string(),
  email: z.string().email(),
  pin: z.string().length(4),
  companyName: z.string(),
  companyEmail: z.string().email(),
  companyPhone: z.string(),
})

auth.post('/register/employer', zValidator('json', registerEmployerSchema), async c => {
  const { phoneNumber, email, pin, companyName, companyEmail, companyPhone } = c.req.valid('json')

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  })

  if (existingUser) {
    return c.json({ error: 'User already exists with this phone number' }, 400)
  }

  // Hash PIN
  const hashedPin = await hashPin(pin)

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      phoneNumber,
      email,
      pin: hashedPin,
      role: 'employer',
    })
    .returning()

  // Create employer profile
  const [newEmployer] = await db
    .insert(employers)
    .values({
      userId: newUser.id,
      companyName,
      companyEmail,
      companyPhone,
    })
    .returning()

  // Generate token
  const token = generateToken({ userId: newUser.id, role: newUser.role })

  return c.json({
    success: true,
    token,
    user: {
      id: newUser.id,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      role: newUser.role,
    },
    employer: {
      id: newEmployer.id,
      companyName: newEmployer.companyName,
    },
  })
})

// ============================================================================
// LOGIN
// ============================================================================

const loginSchema = z.object({
  phoneNumber: z.string(),
  pin: z.string().length(4),
})

auth.post('/login', zValidator('json', loginSchema), async c => {
  const { phoneNumber, pin } = c.req.valid('json')

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  })

  if (!user || !user.pin) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  // Verify PIN
  const isValid = await verifyPin(pin, user.pin)

  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  // Generate token
  const token = generateToken({ userId: user.id, role: user.role })

  // Get additional profile data based on role
  let profile = null
  if (user.role === 'employer') {
    profile = await db.query.employers.findFirst({
      where: eq(employers.userId, user.id),
    })
  } else if (user.role === 'employee') {
    profile = await db.query.employees.findFirst({
      where: eq(employees.userId, user.id),
    })
  }

  return c.json({
    success: true,
    token,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    },
    profile,
  })
})

// ============================================================================
// GET CURRENT USER
// ============================================================================

auth.get('/me', async c => {
  // TODO: Add auth middleware
  return c.json({ message: 'Get current user - requires auth' })
})

export default auth
