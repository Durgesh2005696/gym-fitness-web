# Backend API Testing Guide

## Overview

This directory contains comprehensive test suites for the Fitness Management App backend API. Tests are written using **Jest** and **Supertest**.

## Test Structure

```
__tests__/
├── utils/
│   └── testHelpers.js       # Database setup and test user utilities
├── auth.test.js             # Authentication API tests
├── users.test.js            # User management API tests
├── payments.test.js         # Payment API tests
└── plans-logs.test.js       # Plans and Logs API tests
```

## Installation

Install test dependencies:

```bash
cd backend
npm install
```

This will install:
- `jest` - Testing framework
- `supertest` - HTTP assertion library
- `@faker-js/faker` - Test data generation

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test auth.test.js
```

## Test Coverage

### Authentication Tests (`auth.test.js`)
- ✅ User registration (CLIENT, TRAINER)
- ✅ User login with valid/invalid credentials
- ✅ JWT token generation
- ✅ Single-device login enforcement
- ✅ Get current user profile (`/api/auth/me`)

### User Management Tests (`users.test.js`)
- ✅ Get all users (admin only)
- ✅ Get clients list
- ✅ Get trainers list
- ✅ Toggle user active status
- ✅ Assign trainer to client
- ✅ Renew subscription
- ✅ Update client questionnaire
- ✅ Delete user (with admin protection)

### Payment Tests (`payments.test.js`)
- ✅ Submit payment request
- ✅ Get pending payments (admin only)
- ✅ Approve payment (activates user + sets 30-day expiry)
- ✅ Reject payment
- ✅ Prevent duplicate approvals

### Plans & Logs Tests (`plans-logs.test.js`)
- ✅ Create diet plan for client
- ✅ Create workout plan for client
- ✅ Get plans for specific client
- ✅ Create water/weight/note logs
- ✅ Get logs with type filtering
- ✅ Log pagination (max 50 results)

## Test Utilities

### `testHelpers.js`

Provides utility functions for test setup:

- `clearDatabase()` - Clears all data from test database
- `createTestAdmin()` - Creates admin user (admin@test.com / admin123)
- `createTestTrainer()` - Creates trainer user (trainer@test.com / trainer123)
- `createTestClient()` - Creates inactive client (client@test.com / client123)
- `createActiveClient()` - Creates active client with valid subscription

## Test Database

Tests use the same SQLite database configured in `.env`. Each test suite:
1. Clears the database before running (`beforeAll`)
2. Creates necessary test users
3. Cleans up after completion (`afterAll`)

> **Note**: Tests run sequentially (`--runInBand`) to avoid database conflicts.

## Writing New Tests

### Example Test Structure

```javascript
const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/utils/prismaClient');
const { clearDatabase, createTestAdmin } = require('../utils/testHelpers');

describe('My API Tests', () => {
    let adminToken;

    beforeAll(async () => {
        await clearDatabase();
        await createTestAdmin();
        
        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'admin123' });
        adminToken = login.body.token;
    });

    afterAll(async () => {
        await clearDatabase();
        await prisma.$disconnect();
    });

    it('should do something', async () => {
        const res = await request(app)
            .get('/api/endpoint')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    });
});
```

## Common Patterns

### Authenticated Requests
```javascript
const res = await request(app)
    .get('/api/protected-route')
    .set('Authorization', `Bearer ${token}`);
```

### POST with JSON Body
```javascript
const res = await request(app)
    .post('/api/endpoint')
    .send({ key: 'value' });
```

### Testing Error Cases
```javascript
it('should return 404 for non-existent resource', async () => {
    const res = await request(app).get('/api/users/invalid-id');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User not found');
});
```

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd backend
    npm install
    npm test
```

## Troubleshooting

### Tests failing with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check that `server.js` exports the Express app

### Database conflicts
- Tests should run sequentially: `jest --runInBand`
- Ensure `clearDatabase()` is called in `beforeAll`

### Token expiration issues
- JWT tokens are valid for 30 days by default
- Tokens are generated fresh in each test suite

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data after tests
3. **Descriptive names**: Use clear test descriptions
4. **Arrange-Act-Assert**: Follow AAA pattern
5. **Mock external services**: Don't make real API calls in tests

## Future Improvements

- [ ] Add integration tests for complete user flows
- [ ] Add performance/load testing
- [ ] Add API documentation testing (OpenAPI/Swagger)
- [ ] Add mutation testing for code quality
