import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import {string} from 'rollup-plugin-string';
import pkg from './package.json';

export default [
    {
        input: 'src/index.ts',
        plugins: [string({include: '**/*.ts.txt'}), ts(), json()],
        external: [
            ...Object.keys(pkg.dependencies),
            'path', 'crypto', 'yargs/helpers'
        ],
        output: {
            file: 'lib/cli.js',
            format: 'cjs'
        }
    }
];
