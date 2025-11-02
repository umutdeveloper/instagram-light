// jest.config.js
import nextJest from 'next/jest.js';
const createJestConfig = nextJest({ dir: './' });

const customConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
};

export default createJestConfig(customConfig);
