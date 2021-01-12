import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import * as path from 'path';

require('dotenv').config();

const production = process.env.NODE_ENV === 'production';
const banner = `/*! Weclapp SDK ${pkg.version} MIT | https://github.com/weclapp/sdk */`;
const dist = (...paths) => path.resolve(__dirname, process.env.SDK_REPOSITORY, ...paths);
const plugins = [ts(), ...(production ? [terser()] : [])];

const output = dir => [
    {
        banner,
        globals: {'node-fetch': 'fetch'},
        file: dist(dir, 'index.js'),
        name: 'Weclapp',
        format: 'umd',
        sourcemap: true
    },
    {
        banner,
        globals: {'node-fetch': 'fetch'},
        file: dist(dir, 'index.mjs'),
        format: 'es',
        sourcemap: true
    }
];

export default [

    // Main bundle
    {
        input: 'lib/sdk.ts',
        output: output('main'),
        plugins: [
            copy({
                targets: [

                    // Copy static files
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
            }),
            ...plugins
        ]
    },

    // NodeJS bundle
    {
        input: 'lib/sdk.node.ts',
        output: output('node'),
        external: ['node-fetch'],
        plugins: [
            copy({
                targets: [

                    // The node edition shares the same types, copy it from the main bundle
                    {src: './sdk/main/index.d.ts', dest: dist('node')}
                ]
            }),
            ...plugins
        ]
    }
];
