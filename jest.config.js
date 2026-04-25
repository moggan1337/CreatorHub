module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 10000,
  modulePathIgnorePatterns: ['<rootDir>/node_modules/']
};
