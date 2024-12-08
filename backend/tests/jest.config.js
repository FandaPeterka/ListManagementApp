// tests/jest.config.js

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  maxWorkers: 1,
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '../**/*.{js,jsx}',
    '!../node_modules/**',
    '!../coverage/**',
    '!../tests/**',
    '!../jest.config.js',
    '!../server.js',
    '!../config/**',
  ],
  coverageReporters: ['text', 'lcov'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleDirectories: ['node_modules', 'features', 'middleware', 'utils', 'config'],
};