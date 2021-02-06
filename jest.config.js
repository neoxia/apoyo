module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/tests/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  transform: {
    '.(ts|tsx)': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  collectCoverageFrom: ['src/*.{js,ts}']
}
