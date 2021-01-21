import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import * as path from 'path';
import * as fs from 'fs';
import {config} from 'dotenv';

// Load env variables
config();

// Read package.json and check for production mode
const pkg = JSON.parse(fs.readFileSync('./package.json'));
const production = process.env.NODE_ENV === 'production';

// Short functions to resolve dist / src files
const dist = (...paths) => path.resolve(process.cwd(), process.env.SDK_REPOSITORY, ...paths);
const src = (...paths) => path.resolve(dist(), 'src', ...paths);

// Copies the sdk types to the given folder
const copyTypes = (...dest) => copy({
    targets: [{src: './sdk/types/index.d.ts', dest: dist(...dest)}]
});

// Maps globals to everything
const globals = (...globals) => globals.reduce((pv, cv) => ({[cv]: '*', ...pv}), {});

// Builds an output config with given defaults
const output = config => ({
    sourcemap: true,
    banner: `/*! Weclapp SDK ${pkg.version} MIT | https://github.com/weclapp/sdk */`,
    ...config
});

// Generalized output files for noed bundles
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
            ...(production ? [terser()] : []),
            ts(),
            copyTypes('main'),
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
        plugins: [
            ts(),
            copyTypes('rx'),
            ...(production ? [terser()] : [])
        ],
        output: [
            output({
                file: dist('rx', 'index.js'),
                name: 'Weclapp',
                format: 'umd',
                globals: globals('rxjs')
            }),
            output({
                file: dist('rx', 'index.mjs'),
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
            copyTypes('node')
        ]
    },

    // NodeJS bundle (rxjs)
    {
        input: src('sdk.rx.node.ts'),
        output: nodeOutput('node/rx'),
        external: ['node-fetch', 'url', 'rxjs'],
        plugins: [
            ts(),
            copyTypes('node/rx')
        ]
    },

    // Utilities
    {
        input: src('utils.ts'),
        output: nodeOutput('utils'),
        plugins: [ts()]
    }
];
