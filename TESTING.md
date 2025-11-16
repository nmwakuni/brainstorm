# Testing Documentation

Complete guide for testing the Salary Advance Platform.

## 📋 Table of Contents

1. [Test Overview](#test-overview)
2. [Running Tests](#running-tests)
3. [Test Coverage](#test-coverage)
4. [Writing Tests](#writing-tests)
5. [Test Structure](#test-structure)
6. [Continuous Integration](#continuous-integration)

---

## Test Overview

### Testing Stack

- **Framework**: Jest 30.x
- **TypeScript Support**: ts-jest
- **API Testing**: Supertest (for integration tests)
- **Test Environment**: Node.js

### What's Tested

#### ✅ Unit Tests

**Business Logic (packages/lib)**:
- ✅ Salary calculations (`calculateEarnedToDate`)
- ✅ Advance limit calculations (`calculateMaxAdvance`)
- ✅ Fee calculations (`calculateAdvanceFee`)
- ✅ Net pay calculations (`calculateNetPay`)
- ✅ Advance eligibility checks (`canRequestAdvance`)

**Authentication (packages/lib)**:
- ✅ PIN hashing (`hashPin`)
- ✅ PIN verification (`verifyPin`)
- ✅ JWT token generation (`generateToken`)
- ✅ JWT token verification (`verifyToken`)

### Test Statistics

- **Total Tests**: 29 passing
- **Test Suites**: 2 passing
- **Coverage**: Business logic functions (100% for critical paths)

---

## Running Tests

### Run All Tests

```bash
pnpm test
```

### Watch Mode (Development)

```bash
pnpm test:watch
```

### Coverage Report

```bash
pnpm test:coverage
```

This generates:
- Console output with coverage summary
- HTML report in `coverage/` directory
- LCOV report for CI integration

### Run Specific Test File

```bash
pnpm test calculations.test.ts
```

### Run Tests for Specific Package

```bash
cd packages/lib
pnpm test
```

---

## Test Coverage

### Current Coverage

```
File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
lib/src/calculations  |   100   |   100    |   100   |   100
lib/src/auth          |   100   |   100    |   100   |   100
```

### Coverage Goals

- **Critical Business Logic**: 100% coverage
- **API Routes**: 80%+ coverage (to be added)
- **Utilities**: 90%+ coverage

---

## Writing Tests

### Test File Naming

- Place tests in `__tests__` directory
- Name pattern: `*.test.ts` or `*.test.tsx`
- Mirror source file structure

Example:
```
packages/lib/src/
├── calculations.ts
└── __tests__/
    └── calculations.test.ts
```

### Test Structure

```typescript
import { functionToTest } from '../module'

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should handle normal case', () => {
      const result = functionToTest(input)
      expect(result).toBe(expected)
    })

    it('should handle edge case', () => {
      // Test edge cases
    })

    it('should handle error case', () => {
      // Test error handling
    })
  })
})
```

### Best Practices

1. **Descriptive Test Names**: Use "should" statements
   ```typescript
   it('should calculate 50% of earned wages by default', () => {})
   ```

2. **Arrange-Act-Assert Pattern**:
   ```typescript
   // Arrange
   const monthlySalary = 60000
   const daysWorked = 15

   // Act
   const earned = calculateEarnedToDate(monthlySalary, daysWorked, 30)

   // Assert
   expect(earned).toBe(30000)
   ```

3. **Test Edge Cases**:
   - Zero values
   - Negative values
   - Maximum values
   - Boundary conditions

4. **Test Error Handling**:
   - Invalid inputs
   - Null/undefined values
   - Authentication failures

---

## Test Structure

### Unit Tests (Current)

Located in `packages/lib/src/__tests__/`:

#### calculations.test.ts
Tests for salary and advance calculations:
- Earned wages calculation
- Max advance calculation
- Fee calculation
- Net pay calculation
- Advance eligibility rules

**Example Test**:
```typescript
it('should calculate earned wages correctly for half month worked', () => {
  const monthlySalary = 60000
  const daysWorked = 15
  const totalWorkDaysInMonth = 30

  const earned = calculateEarnedToDate(monthlySalary, daysWorked, totalWorkDaysInMonth)

  expect(earned).toBe(30000)
})
```

#### auth.test.ts
Tests for authentication functions:
- PIN hashing with bcrypt
- PIN verification
- JWT token generation
- JWT token validation
- Full auth flow integration

**Example Test**:
```typescript
it('should verify correct PIN', async () => {
  const pin = '1234'
  const hash = await hashPin(pin)

  const isValid = await verifyPin(pin, hash)

  expect(isValid).toBe(true)
})
```

### Integration Tests (TODO)

To be added in `apps/api/src/__tests__/`:
- Auth endpoints (login, register)
- Employee endpoints
- Employer endpoints
- Advance request flow
- M-Pesa integration (mocked)

### E2E Tests (TODO)

Future additions:
- Complete user flows
- Multi-user scenarios
- M-Pesa webhook handling

---

## Continuous Integration

### Pre-commit Checks

Before committing, run:
```bash
pnpm test
pnpm lint
pnpm format:check
```

### CI Pipeline (Recommended)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm lint
      - run: pnpm build
```

---

## Test Data

### Test Fixtures

Use realistic but safe test data:

```typescript
const testEmployee = {
  monthlySalary: 50000,
  daysWorked: 15,
  totalWorkDays: 30,
}

const testAdvance = {
  amount: 5000,
  feePercentage: 4,
  flatFee: 0,
}
```

### Mock Data

For integration tests:

```typescript
const mockMpesaResponse = {
  OriginatorConversationID: 'test-123',
  ConversationID: 'AG_20240101_123456',
  ResponseCode: '0',
  ResponseDescription: 'Accept the service request successfully.',
}
```

---

## Debugging Tests

### Run Tests in Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then attach your debugger (VS Code, Chrome DevTools).

### Verbose Output

```bash
pnpm test --verbose
```

### Only Failed Tests

```bash
pnpm test --onlyFailures
```

---

## Future Testing Roadmap

### Phase 1 (Current) ✅
- [x] Unit tests for business logic
- [x] Unit tests for authentication
- [x] Jest configuration
- [x] Test documentation

### Phase 2 (Next)
- [ ] API integration tests
- [ ] Database operation tests
- [ ] M-Pesa service mocking
- [ ] Error handling tests

### Phase 3 (Future)
- [ ] E2E tests with test database
- [ ] Performance tests
- [ ] Load testing
- [ ] Security testing

---

## Common Issues

### Issue: "Cannot find module"

**Solution**: Build shared packages first
```bash
pnpm build --filter=@salary-advance/types --filter=@salary-advance/lib
pnpm test
```

### Issue: "esModuleInterop" warning

**Solution**: This is a ts-jest warning and can be safely ignored, or add to tsconfig.json:
```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

### Issue: Tests timeout

**Solution**: Increase Jest timeout
```typescript
jest.setTimeout(10000) // 10 seconds
```

---

## Contributing

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Maintain coverage** above 80% for critical paths
3. **Document test cases** with clear descriptions
4. **Run full test suite** before submitting PR

---

**Built with ❤️ in Kenya 🇰🇪**
