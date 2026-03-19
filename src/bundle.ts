import { currentDirname } from '@utils/currentDirname';
import { dirname, resolve } from 'path';
import { OutputOptions, rolldown, RolldownOptions } from 'rolldown';
import { createProgram, parseJsonConfigFileContent, readConfigFile, sys } from 'typescript';
import { Target } from './target';

const tsconfig = resolve(currentDirname(), './tsconfig.sdk.json');
const resolveGlobals = (...globals: string[]) => Object.fromEntries(globals.map((v) => [v, '*']));

const emitDeclarations = (tsconfigPath: string, outDir: string) => {
  const configFile = readConfigFile(tsconfigPath, (path) => sys.readFile(path));
  const parsed = parseJsonConfigFileContent(configFile.config, sys, dirname(tsconfigPath));

  const program = createProgram(parsed.fileNames, {
    ...parsed.options,
    emitDeclarationOnly: true,
    declarationDir: outDir,
    noEmit: false
  });

  program.emit();
};

const generateOutput = (config: OutputOptions): OutputOptions => ({
  sourcemap: false,
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

  const bundles: Record<Target, () => RolldownOptions> = {
    [Target.BROWSER_PROMISES]: () => ({
      input: src('index.ts'),
      resolve: { tsconfigFilename: tsconfig },
      output: [
        generateOutput({
          file: dist('index.js'),
          format: 'es',
          minify: true
        })
      ]
    }),
    [Target.BROWSER_RX]: () => ({
      input: src('index.ts'),
      resolve: { tsconfigFilename: tsconfig },
      external: ['rxjs'],
      output: [
        generateOutput({
          file: dist('index.js'),
          format: 'es',
          minify: true,
          globals: resolveGlobals('rxjs')
        })
      ]
    }),
    [Target.NODE_PROMISES]: () => ({
      input: src('index.ts'),
      resolve: { tsconfigFilename: tsconfig },
      external: ['node-fetch', 'url'],
      output: generateNodeOutput().map((o) => ({ ...o, minify: true }))
    }),
    [Target.NODE_RX]: () => ({
      input: src('index.ts'),
      resolve: { tsconfigFilename: tsconfig },
      external: ['node-fetch', 'url', 'rxjs'],
      output: generateNodeOutput().map((o) => ({ ...o, minify: true }))
    })
  };

  const config = bundles[target]();
  const result = await rolldown(config);

  if (Array.isArray(config.output)) {
    await Promise.all(config.output.map((o) => result.write(o)));
  } else if (config.output) {
    await result.write(config.output);
  }

  await result.close();

  emitDeclarations(tsconfig, dist());
};
