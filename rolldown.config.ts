import { readFileSync } from 'fs';
import { builtinModules } from 'module';

import { createFilter } from '@rollup/pluginutils';
import { defineConfig, Plugin } from 'rolldown';
import pkg from './package.json' with { type: 'json' };

const txt = (): Plugin => {
  const filter = createFilter('**/*.ts.txt');
  return {
    name: 'txt',
    load(id: string) {
      if (filter(id)) {
        const code = readFileSync(id, 'utf-8');
        return {
          code: `export default ${JSON.stringify(code)};`,
          moduleType: 'js'
        };
      }
    }
  };
};

const nodeBuiltins = builtinModules.flatMap((m) => [m, `node:${m}`]);

export default defineConfig({
  input: 'src/index.ts',
  plugins: [txt()],
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.devDependencies),
    ...Object.keys(pkg.peerDependencies),
    ...nodeBuiltins,
    'yargs/helpers',
    '../package.json'
  ],
  output: {
    dir: 'dist',
    entryFileNames: 'cli.js',
    format: 'es'
  }
});
