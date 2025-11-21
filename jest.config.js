const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Chemin vers votre app Next.js pour charger next.config.js et .env
  dir: './',
})

// Configuration Jest personnalisée
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Gérer les alias CSS modules
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Gérer les imports d'images
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',

    // Gérer les alias de chemins (@/)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
  },
}

// createJestConfig est exporté de cette manière pour que next/jest
// puisse charger la config Next.js de façon asynchrone
module.exports = createJestConfig(customJestConfig)
