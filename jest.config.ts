module.exports = {
  preset: 'ts-jest',
  verbose: true,
  moduleFileExtensions: ['js', 'ts'],
  rootDir: '',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
