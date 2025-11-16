import { hashPin, verifyPin, generateToken, verifyToken } from '../auth'

describe('Authentication Functions', () => {
  describe('hashPin', () => {
    it('should hash a PIN correctly', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(pin)
      expect(hash.length).toBeGreaterThan(20)
    })

    it('should generate different hashes for same PIN', async () => {
      const pin = '5678'
      const hash1 = await hashPin(pin)
      const hash2 = await hashPin(pin)

      expect(hash1).not.toBe(hash2) // bcrypt uses random salt
    })
  })

  describe('verifyPin', () => {
    it('should verify correct PIN', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)

      const isValid = await verifyPin(pin, hash)

      expect(isValid).toBe(true)
    })

    it('should reject incorrect PIN', async () => {
      const correctPin = '1234'
      const incorrectPin = '4321'
      const hash = await hashPin(correctPin)

      const isValid = await verifyPin(incorrectPin, hash)

      expect(isValid).toBe(false)
    })

    it('should reject PIN with different digits', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)

      const isValid = await verifyPin('5678', hash)

      expect(isValid).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const payload = { userId: 'user-123', role: 'employee' }

      const token = generateToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })

    it('should generate different tokens for different users', () => {
      const payload1 = { userId: 'user-1', role: 'employee' }
      const payload2 = { userId: 'user-2', role: 'employer' }

      const token1 = generateToken(payload1)
      const token2 = generateToken(payload2)

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('should verify and decode valid token', () => {
      const payload = { userId: 'user-123', role: 'employee' }
      const token = generateToken(payload)

      const decoded = verifyToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.role).toBe(payload.role)
    })

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here'

      const decoded = verifyToken(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token'

      const decoded = verifyToken(malformedToken)

      expect(decoded).toBeNull()
    })

    it('should return null for empty token', () => {
      const decoded = verifyToken('')

      expect(decoded).toBeNull()
    })
  })

  describe('PIN + Token Integration', () => {
    it('should complete full auth flow correctly', async () => {
      // Simulate user registration
      const userPin = '9876'
      const hashedPin = await hashPin(userPin)

      // Simulate user login
      const isValidLogin = await verifyPin(userPin, hashedPin)
      expect(isValidLogin).toBe(true)

      // Generate token after successful login
      const token = generateToken({ userId: 'emp-456', role: 'employee' })

      // Verify token on subsequent requests
      const decoded = verifyToken(token)
      expect(decoded?.userId).toBe('emp-456')
      expect(decoded?.role).toBe('employee')
    })
  })
})
