import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@database/(.*)$': '<rootDir>/packages/database/src/$1',
    '^@minimal-api/(.*)$': '<rootDir>/packages/minimal-api/src/$1',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/index.ts',
    '!**/node_modules/**',
  ],
  projects: [
    {
      displayName: 'core',
      testMatch: ['<rootDir>/packages/core/src/**/*.test.ts'],
      moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
      },
    },
    {
      displayName: 'database',
      testMatch: ['<rootDir>/packages/database/src/**/*.test.ts'],
      moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
        '^@database/(.*)$': '<rootDir>/packages/database/src/$1',
      },
    },
    {
      displayName: 'minimal-api',
      testMatch: ['<rootDir>/packages/minimal-api/src/**/*.test.ts'],
      moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
        '^@database/(.*)$': '<rootDir>/packages/database/src/$1',
        '^@minimal-api/(.*)$': '<rootDir>/packages/minimal-api/src/$1',
      },
    },
  ],
};

export default config;
