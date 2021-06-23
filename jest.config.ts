export default {
    preset: 'ts-jest',
    coverageReporters: ['lcov', 'text'],
    testEnvironment: 'node',
    collectCoverageFrom: ['./sdk/node/**/*.js'],
    setupFiles: ['./tests/setup.ts'],
    setupFilesAfterEnv: ['jest-extended'],
    moduleNameMapper: {
        '@sdk/(.*)$': '<rootDir>/sdk/$1',
        '@tests/(.*)$': '<rootDir>/tests/$1',
        '@/(.*)$': '<rootDir>/$1'
    }
};
