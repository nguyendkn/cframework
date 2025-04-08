// This file is run before each test file
import 'reflect-metadata';

// Global test setup
beforeAll(() => {
  // Setup code that runs before all tests
  console.log('Starting test suite');
});

afterAll(() => {
  // Cleanup code that runs after all tests
  console.log('Test suite completed');
});

// Reset mocks between tests
beforeEach(() => {
  jest.resetAllMocks();
});
