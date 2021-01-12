import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import pkg from './package.json';

const production = process.env.NODE_ENV === 'production';
const banner = `/*! Weclapp SDK ${pkg.version} MIT | https://github.com/weclapp/sdk */`;

export default [
    {
        input: 'sdk/index.ts',
        plugins: [ts(), ...(production ? [terser()] : [])],
        output: [
            {
                banner,
                file: pkg.main,
                name: 'Weclapp',
                format: 'umd',
                sourcemap: true
            },
            {
                banner,
                file: pkg.module,
                format: 'es',
                sourcemap: true
            }
        ]
    }
];
