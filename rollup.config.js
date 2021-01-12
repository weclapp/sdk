import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import * as path from 'path';

require('dotenv').config();

const production = process.env.NODE_ENV === 'production';
const banner = `/*! Weclapp SDK ${pkg.version} MIT | https://github.com/weclapp/sdk */`;
const dist = (...paths) => path.resolve(__dirname, process.env.SDK_REPOSITORY, ...paths);
const plugins = [ ts(),  ...(production ? [terser()] : [])]
const output = name => [
    {
        banner,
        globals: {'node-fetch': 'fetch'},
        file: dist('lib', `${name}.js`),
        name: 'Weclapp',
        format: 'umd',
        sourcemap: true
    },
    {
        banner,
        globals: {'node-fetch': 'fetch'},
        file: dist('lib', `${name}.mjs`),
        format: 'es',
        sourcemap: true
    }
];

export default [
    {
        input: 'lib/sdk.ts',
        plugins: [
            copy({
                targets: [
                    {src: './static/README.md', dest: dist()},
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
        ],
        output: output('sdk')
    },
    {
        input: 'lib/sdk.node.ts',
        output: output('node'),
        external: ['node-fetch'],
        plugins
    }
];
