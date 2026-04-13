import { generateImport } from '@ts/generateImport';
import { describe, expect, it } from 'vitest';

describe('generateImport', () => {
  it('generates a named import', () => {
    const result = generateImport({ src: './module', imports: ['foo', 'bar'] });
    expect(result).toBe("import {foo, bar} from './module';");
  });

  it('generates a default import', () => {
    const result = generateImport({ src: './module', default: 'Mod' });
    expect(result).toBe("import Mod from './module';");
  });

  it('generates both default and named imports', () => {
    const result = generateImport({ src: './module', default: 'Mod', imports: ['foo'] });
    expect(result).toBe("import Mod, {foo} from './module';");
  });

  it('handles empty imports array', () => {
    const result = generateImport({ src: './module', imports: [] });
    expect(result).toBe("import  from './module';");
  });
});
