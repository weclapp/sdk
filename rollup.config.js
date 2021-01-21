import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import * as path from 'path';

require('dotenv').config();

const production = process.env.NODE_ENV === 'production';
const dist = (...paths) => path.resolve(__dirname, process.env.SDK_REPOSITORY, ...paths);
const src = (...paths) => path.resolve(dist(), 'src', ...paths);

const globals = (...globals) => globals.reduce((pv, cv) => ({[cv]: '*', ...pv}), {});
const output = config => ({
    sourcemap: true,
    banner: `/*! Weclapp SDK ${pkg.version} MIT | https://github.com/weclapp/sdk */`,
    ...config
});

const nodeOutput = dir => [
    output({
        file: dist(dir, 'index.js'),
        format: 'cjs',
        globals: globals('node-fetch', 'url')
    }),
    output({
        file: dist(dir, 'index.mjs'),
        format: 'es',
        globals: globals('node-fetch', 'url')
    })
];

export default [

    // Browser bundle (promises)
    {
        input: src('sdk.ts'),
        output: [
            output({
                file: dist('main', 'index.js'),
                name: 'Weclapp',
                format: 'umd'
            }),
            output({
                file: dist('main', 'index.mjs'),
                format: 'es'
            })
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

    // Browser bundle (rxjs)
    {
        input: src('sdk.rx.ts'),
        external: ['rxjs'],
        plugins: [ts(), ...(production ? [terser()] : [])],
        output: [
            output({
                file: dist('main', 'rx', 'index.js'),
                name: 'Weclapp',
                format: 'umd',
                globals: globals('rxjs')
            }),
            output({
                file: dist('main', 'rx', 'index.mjs'),
                format: 'es',
                globals: globals('rxjs')
            })
        ]
    },

    // NodeJS bundle (promises)
    {
        input: src('sdk.node.ts'),
        output: nodeOutput('node'),
        external: ['node-fetch', 'url'],
        plugins: [
            ts(),
            copy({
                targets: [

                    // The node edition shares the same types, copy it from the main bundle
                    {src: './sdk/main/index.d.ts', dest: dist('node')}
                ]
            })
        ]
    },

    // NodeJS bundle (rxjs)
    {
        input: src('sdk.rx.node.ts'),
        output: nodeOutput('node/rx'),
        external: ['node-fetch', 'url', 'rxjs'],
        plugins: [ts()]
    }
];
