import {terser} from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import {OutputOptions, rollup, RollupOptions} from 'rollup';
import * as path from 'path';

// Short functions to resolve dist / src files
const dist = (...paths: string[]) => path.resolve(process.cwd(), './sdk', ...paths);
const src = (...paths: string[]) => path.resolve(dist(), 'src', ...paths);

// Maps globals to everything
const globals = (...globals: string[]) => globals.reduce((pv, cv) => ({[cv]: '*', ...pv}), {});

// Builds an output config with given defaults
const output = (config: Record<string, any>) => ({
    sourcemap: true,
    banner: `/*! Weclapp SDK */`,
    ...config
});

// Generalized output files for noed bundles
const nodeOutput = (dir: string) => [
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

const configs: RollupOptions[] = [

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
        plugins: [ts(), terser()]
    },

    // Browser bundle (rxjs)
    {
        input: src('sdk.rx.ts'),
        external: ['rxjs'],
        plugins: [ts(), terser()],
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
        plugins: [ts()]
    },

    // NodeJS bundle (rxjs)
    {
        input: src('sdk.rx.node.ts'),
        output: nodeOutput('node/rx'),
        external: ['node-fetch', 'url', 'rxjs'],
        plugins: [ts()]
    },

    // Utilities
    {
        input: src('utils/index.ts'),
        output: nodeOutput('utils'),
        plugins: [ts()]
    }
];

export const buildSDK = async () => {
    return Promise.all(
        configs.map(async config => {
            const bundle = await rollup(config);

            if (Array.isArray(config.output)) {
                await Promise.all(config.output.map(bundle.write));
            } else if (config.output) {
                await bundle.write(config.output);
            }

            await bundle.close();
        })
    );
};
