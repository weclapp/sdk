import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import * as path from 'path';

require('dotenv').config();

const production = process.env.NODE_ENV === 'production';
const banner = `/*! Weclapp SDK ${pkg.version} MIT | https://github.com/weclapp/sdk */`;
const dist = (...paths) => path.resolve(__dirname, process.env.SDK_REPOSITORY, ...paths);

export default [
    {
        input: 'lib/index.ts',
        plugins: [
            ts(),
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
            ...(production ? [terser()] : [])
        ],
        output: [
            {
                banner,
                file: dist('lib', 'sdk.min.js'),
                name: 'Weclapp',
                format: 'umd',
                sourcemap: true
            },
            {
                banner,
                file: dist('lib', 'sdk.min.mjs'),
                format: 'es',
                sourcemap: true
            }
        ]
    }
];
