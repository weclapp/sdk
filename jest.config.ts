export default {
    preset: 'ts-jest',
    coverageReporters: ['lcov', 'text'],
    testEnvironment: 'node',
    collectCoverageFrom: ['./lib/**/*.js'],
    setupFiles: ['./tests/setup.ts'],
    setupFilesAfterEnv: ['jest-extended']
};