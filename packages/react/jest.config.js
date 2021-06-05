module.exports = {
  testEnvironment: 'jsdom',
  testRegex: '(/tests/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  transform: {
    '.(ts|tsx)': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@apoyo/(.*?)$': '<rootDir>/../../packages/$1/src'
  },
  setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  /* FIXME: Enable threshold again when coverage has progressed on the project
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },*/
  collectCoverageFrom: ['src/**/*.{ts,tsx}']
}
