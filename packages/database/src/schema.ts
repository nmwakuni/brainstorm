import { pgTable, text, timestamp, decimal, boolean, json } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text('email'),
  phoneNumber: text('phone_number').notNull().unique(),
  pin: text('pin'), // Hashed PIN for authentication
  role: text('role', { enum: ['admin', 'employer', 'employee'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// EMPLOYERS TABLE
// ============================================================================

export const employers = pgTable('employers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  companyEmail: text('company_email').notNull(),
  companyPhone: text('company_phone').notNull(),
  taxPin: text('tax_pin'),
  businessRegistration: text('business_registration'),
  isActive: boolean('is_active').default(true).notNull(),
  settings: json('settings')
    .$type<{
      autoApproveAdvances: boolean
      maxAdvancePercentage: number
      maxAdvancesPerMonth: number
      feePercentage: number
      flatFee: number
    }>()
    .default({
      autoApproveAdvances: true,
      maxAdvancePercentage: 50,
      maxAdvancesPerMonth: 4,
      feePercentage: 4,
      flatFee: 0,
    }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// EMPLOYEES TABLE
// ============================================================================

export const employees = pgTable('employees', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  employerId: text('employer_id')
    .notNull()
    .references(() => employers.id, { onDelete: 'cascade' }),
  employeeNumber: text('employee_number').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  mpesaNumber: text('mpesa_number').notNull(),
  monthlySalary: decimal('monthly_salary', { precision: 12, scale: 2 }).notNull(),
  hireDate: timestamp('hire_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// PAYROLL PERIODS TABLE
// ============================================================================

export const payrollPeriods = pgTable('payroll_periods', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  employerId: text('employer_id')
    .notNull()
    .references(() => employers.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  payDate: timestamp('pay_date').notNull(),
  status: text('status', { enum: ['draft', 'processing', 'completed'] })
    .default('draft')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// PAYROLL ENTRIES TABLE
// ============================================================================

export const payrollEntries = pgTable('payroll_entries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  payrollPeriodId: text('payroll_period_id')
    .notNull()
    .references(() => payrollPeriods.id, { onDelete: 'cascade' }),
  employeeId: text('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  daysWorked: decimal('days_worked', { precision: 5, scale: 2 }).notNull(),
  grossPay: decimal('gross_pay', { precision: 12, scale: 2 }).notNull(),
  deductions: decimal('deductions', { precision: 12, scale: 2 }).default('0').notNull(),
  netPay: decimal('net_pay', { precision: 12, scale: 2 }).notNull(),
  earnedToDate: decimal('earned_to_date', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// ADVANCES TABLE
// ============================================================================

export const advances = pgTable('advances', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  employeeId: text('employee_id')
    .notNull()
    .references(() => employees.id, { onDelete: 'cascade' }),
  employerId: text('employer_id')
    .notNull()
    .references(() => employers.id, { onDelete: 'cascade' }),
  payrollPeriodId: text('payroll_period_id')
    .notNull()
    .references(() => payrollPeriods.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  fee: decimal('fee', { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status', {
    enum: ['pending', 'approved', 'disbursed', 'failed', 'cancelled', 'repaid'],
  })
    .default('pending')
    .notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
  disbursedAt: timestamp('disbursed_at'),
  failedAt: timestamp('failed_at'),
  failureReason: text('failure_reason'),
  mpesaTransactionId: text('mpesa_transaction_id'),
  mpesaConversationId: text('mpesa_conversation_id'),
  repaidAt: timestamp('repaid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// TRANSACTIONS TABLE
// ============================================================================

export const transactions = pgTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  advanceId: text('advance_id')
    .notNull()
    .references(() => advances.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['advance_disbursement', 'advance_repayment', 'fee'] }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed'] })
    .default('pending')
    .notNull(),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================================
// TYPES (inferred from schema)
// ============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Employer = typeof employers.$inferSelect
export type NewEmployer = typeof employers.$inferInsert

export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert

export type PayrollPeriod = typeof payrollPeriods.$inferSelect
export type NewPayrollPeriod = typeof payrollPeriods.$inferInsert

export type PayrollEntry = typeof payrollEntries.$inferSelect
export type NewPayrollEntry = typeof payrollEntries.$inferInsert

export type Advance = typeof advances.$inferSelect
export type NewAdvance = typeof advances.$inferInsert

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
