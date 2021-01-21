import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import * as path from 'path';

require('dotenv').config();

const production = process.env.NODE_ENV === 'production';
const dist = (...paths) => path.resolve(__dirname, process.env.SDK_REPOSITORY, ...paths);
const src = (...paths) => path.resolve(dist(), 'src', ...paths);

const baseOutput = {
    sourcemap: true,
    banner: `/*! Weclapp SDK ${pkg.version} MIT | https://github.com/weclapp/sdk */`
};

const globals = {
    'node-fetch': 'fetch',
    'url': 'URLSearchParams'
};

export default [

    // Browser bundle
    {
        input: src('sdk.ts'),
        output: [
            {
                ...baseOutput,
                file: dist('main', 'index.js'),
                name: 'Weclapp',
                format: 'umd'
            },
            {
                ...baseOutput,
                file: dist('main', 'index.mjs'),
                format: 'es'
            }
        ],
        plugins: [
            ts(),
            ...(production ? [terser()] : []),
            copy({
                targets: [

                    // Copy static files
                    // TODO: Host logo somewhere and drop /www folder?
                    {src: './static/logo.svg', dest: dist('www')},
                    {src: './static/README.md', dest: dist()},
                    {src: './static/.gitignore', dest: dist()},

                    // Update package.json version
                    {
                        src: './static/package.json',
                        dest: dist(),
                        transform(contents) {
                            const parsed = JSON.parse(contents.toString());
                            parsed.version = process.env.SDK_VERSION;
                            return JSON.stringify(parsed, null, 4);
                        }
                    }
                ]
            })
        ]
    },

    // NodeJS bundle
    {
        input: src('sdk.node.ts'),
        external: ['node-fetch', 'url'],
        output: [
            {
                ...baseOutput,
                file: dist('node', 'index.js'),
                format: 'cjs',
                globals
            },
            {
                ...baseOutput,
                file: dist('node', 'index.mjs'),
                format: 'es',
                globals
            }
        ],
        plugins: [
            ts(),
            copy({
                targets: [

                    // The node edition shares the same types, copy it from the main bundle
                    {src: './sdk/main/index.d.ts', dest: dist('node')}
                ]
            })
        ]
    }
];
