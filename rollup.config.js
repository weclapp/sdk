import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const variables = replace({
    preventAssignment: true,
    VERSION: JSON.stringify(pkg.version)
});

export default [
    {
        input: 'src/index.ts',
        plugins: [ts(), json(), variables],
        external: [
            'dotenv', 'fs-extra', 'change-case',
            'indent-string', 'chalk', 'fs',
            'path', 'glob', 'os',
            'child_process', 'util', 'yargs',
            'node-fetch', 'swagger2openapi', 'yargs/helpers'
        ],
        output: {
            file: 'lib/cli.js',
            format: 'cjs'
        }
    }
];
