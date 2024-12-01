// tests/jest.config.js

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  maxWorkers: 1,
  setupFilesAfterEnv: ['./jest.setup.js'], // Relativní cesta k setup souboru uvnitř tests
  collectCoverage: true,
  coverageDirectory: 'coverage', // Coverage složka uvnitř tests
  collectCoverageFrom: [
    '../**/*.{js,jsx}', // Cesty relativní k jest.config.js ve složce tests
    '!../node_modules/**',
    '!../coverage/**',
    '!../tests/**', // Vyloučení všech souborů ve složce tests z coverage
    '!../jest.config.js',
    '!../server.js',
    '!../config/**',
  ],
  coverageReporters: ['text', 'lcov'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleDirectories: ['node_modules', 'features', 'middleware', 'utils', 'config'],
  testTimeout: 10000, // Nastavení globálního timeoutu na 10 sekund
};