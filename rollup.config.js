import ts from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import {string} from 'rollup-plugin-string';
import pkg from './package.json' assert {type: 'json'};

export default [
    {
        input: 'src/index.ts',
        plugins: [string({include: '**/*.ts.txt'}), ts(), json()],
        external: [
            ...Object.keys(pkg.dependencies),
            ...Object.keys(pkg.peerDependencies),
            'path', 'crypto', 'yargs/helpers', 'fs/promises', 'url',
            '../package.json'
        ],
        output: {
            file: 'dist/cli.js',
            format: 'es'
        }
    }
];
