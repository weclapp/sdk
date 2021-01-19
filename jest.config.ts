export default {
    preset: 'ts-jest',
    coverageReporters: ['lcov', 'text'],
    testEnvironment: 'node',
    collectCoverageFrom: ['./sdk/node/**/*.js'],
    setupFiles: ['./tests/setup.ts'],
    setupFilesAfterEnv: ['jest-extended']
};
