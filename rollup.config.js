import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import {string} from 'rollup-plugin-string';

export default [
    {
        input: 'src/index.ts',
        plugins: [string({include: '**/*.ts.txt'}), ts(), json()],
        external: [
            'dotenv', 'fs-extra', 'change-case',
            'indent-string', 'chalk', 'fs',
            'path', 'glob', 'os', 'crypto',
            'child_process', 'util', 'yargs',
            'node-fetch', 'swagger2openapi', 'yargs/helpers',
            'rollup-plugin-ts', 'rollup-plugin-terser', 'rollup',
            'openapi-types'
        ],
        output: {
            file: 'lib/cli.js',
            format: 'cjs'
        }
    }
];
