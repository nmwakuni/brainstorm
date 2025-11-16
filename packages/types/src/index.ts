import { z } from 'zod'

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export const UserRoleSchema = z.enum(['admin', 'employer', 'employee'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  phoneNumber: z.string(),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type User = z.infer<typeof UserSchema>

// ============================================================================
// EMPLOYER TYPES
// ============================================================================

export const EmployerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  companyName: z.string(),
  companyEmail: z.string().email(),
  companyPhone: z.string(),
  taxPin: z.string().optional(),
  businessRegistration: z.string().optional(),
  isActive: z.boolean().default(true),
  settings: z.object({
    autoApproveAdvances: z.boolean().default(true),
    maxAdvancePercentage: z.number().min(0).max(100).default(50),
    maxAdvancesPerMonth: z.number().default(4),
    feePercentage: z.number().default(4),
    flatFee: z.number().default(0),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Employer = z.infer<typeof EmployerSchema>

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export const EmployeeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  employerId: z.string(),
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  mpesaNumber: z.string(),
  monthlySalary: z.number().positive(),
  hireDate: z.date(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Employee = z.infer<typeof EmployeeSchema>

// ============================================================================
// PAYROLL TYPES
// ============================================================================

export const PayrollPeriodSchema = z.object({
  id: z.string(),
  employerId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  payDate: z.date(),
  status: z.enum(['draft', 'processing', 'completed']).default('draft'),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type PayrollPeriod = z.infer<typeof PayrollPeriodSchema>

export const PayrollEntrySchema = z.object({
  id: z.string(),
  payrollPeriodId: z.string(),
  employeeId: z.string(),
  daysWorked: z.number().min(0).max(31),
  grossPay: z.number(),
  deductions: z.number().default(0),
  netPay: z.number(),
  earnedToDate: z.number(), // How much they've earned so far this period
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type PayrollEntry = z.infer<typeof PayrollEntrySchema>

// ============================================================================
// ADVANCE TYPES
// ============================================================================

export const AdvanceStatusSchema = z.enum([
  'pending',
  'approved',
  'disbursed',
  'failed',
  'cancelled',
  'repaid',
])
export type AdvanceStatus = z.infer<typeof AdvanceStatusSchema>

export const AdvanceSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employerId: z.string(),
  payrollPeriodId: z.string(),
  amount: z.number().positive(),
  fee: z.number(),
  totalAmount: z.number(), // amount + fee
  status: AdvanceStatusSchema,
  requestedAt: z.date(),
  approvedAt: z.date().optional(),
  disbursedAt: z.date().optional(),
  failedAt: z.date().optional(),
  failureReason: z.string().optional(),
  mpesaTransactionId: z.string().optional(),
  repaidAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Advance = z.infer<typeof AdvanceSchema>

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export const TransactionTypeSchema = z.enum(['advance_disbursement', 'advance_repayment', 'fee'])
export type TransactionType = z.infer<typeof TransactionTypeSchema>

export const TransactionSchema = z.object({
  id: z.string(),
  advanceId: z.string(),
  type: TransactionTypeSchema,
  amount: z.number(),
  status: z.enum(['pending', 'completed', 'failed']),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Transaction = z.infer<typeof TransactionSchema>

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Auth
export const LoginRequestSchema = z.object({
  phoneNumber: z.string(),
  pin: z.string().length(4),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

// Employee - Request Advance
export const RequestAdvanceSchema = z.object({
  amount: z.number().positive(),
  payrollPeriodId: z.string(),
})
export type RequestAdvance = z.infer<typeof RequestAdvanceSchema>

// Employer - Create Employee
export const CreateEmployeeRequestSchema = z.object({
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  mpesaNumber: z.string(),
  monthlySalary: z.number().positive(),
  hireDate: z.string().or(z.date()),
})
export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeRequestSchema>

// Employer - Upload Payroll
export const UploadPayrollSchema = z.object({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  payDate: z.string().or(z.date()),
  entries: z.array(
    z.object({
      employeeNumber: z.string(),
      daysWorked: z.number(),
      grossPay: z.number(),
      deductions: z.number().default(0),
    })
  ),
})
export type UploadPayroll = z.infer<typeof UploadPayrollSchema>

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
