import { Target } from '@enums/Target';
import { currentDirname } from '@utils/currentDirname';
import { resolve } from 'path';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import terser from '@rollup/plugin-terser';
import ts from '@rollup/plugin-typescript';

const tsconfig = resolve(currentDirname(), './tsconfig.sdk.json');
const resolveGlobals = (...globals: string[]) => Object.fromEntries(globals.map((v) => [v, '*']));

const generateOutput = (config: OutputOptions): OutputOptions => ({
  sourcemap: true,
  banner: `/* weclapp sdk */`,
  ...config
});

export const bundle = async (workingDirectory: string, target: Target) => {
  const dist = (...paths: string[]) => resolve(workingDirectory, 'dist', ...paths);
  const src = (...paths: string[]) => resolve(workingDirectory, 'src', ...paths);

  const generateNodeOutput = () => [
    generateOutput({
      file: dist('index.cjs'),
      format: 'cjs',
      globals: resolveGlobals('node-fetch', 'url')
    }),
    generateOutput({
      file: dist('index.js'),
      format: 'es',
      globals: resolveGlobals('node-fetch', 'url')
    })
  ];

  const bundles: Record<Target, () => RollupOptions> = {
    [Target.BROWSER_PROMISES]: () => ({
      input: src('index.ts'),
      plugins: [ts({ tsconfig, declarationDir: dist(), filterRoot: src() }), terser()],
      output: [
        generateOutput({
          file: dist('index.js'),
          format: 'es'
        })
      ]
    }),
    [Target.BROWSER_RX]: () => ({
      input: src('index.ts'),
      plugins: [ts({ tsconfig, declarationDir: dist(), filterRoot: src() }), terser()],
      external: ['rxjs'],
      output: [
        generateOutput({
          file: dist('index.js'),
          format: 'es',
          globals: resolveGlobals('rxjs')
        })
      ]
    }),
    [Target.NODE_PROMISES]: () => ({
      input: src('index.ts'),
      plugins: [ts({ tsconfig, declarationDir: dist(), filterRoot: src() }), terser()],
      external: ['node-fetch', 'url'],
      output: generateNodeOutput()
    }),
    [Target.NODE_RX]: () => ({
      input: src('index.ts'),
      plugins: [ts({ tsconfig, declarationDir: dist(), filterRoot: src() }), terser()],
      external: ['node-fetch', 'url', 'rxjs'],
      output: generateNodeOutput()
    })
  };

  const config = bundles[target]();
  const bundle = await rollup(config);

  if (Array.isArray(config.output)) {
    await Promise.all(config.output.map(bundle.write));
  } else if (config.output) {
    await bundle.write(config.output);
  }

  await bundle.close();
};
