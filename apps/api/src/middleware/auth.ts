import { Context, Next } from 'hono'
import { verifyToken } from '@salary-advance/lib'

export type AuthContext = {
  Variables: {
    userId: string
    role: string
  }
}

export async function requireAuth(c: Context<AuthContext>, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401)
  }

  c.set('userId', payload.userId)
  c.set('role', payload.role)

  await next()
}

export function requireRole(...roles: string[]) {
  return async (c: Context<AuthContext>, next: Next) => {
    const userRole = c.get('role')

    if (!roles.includes(userRole)) {
      return c.json({ error: 'Forbidden - Insufficient permissions' }, 403)
    }

    await next()
  }
}
