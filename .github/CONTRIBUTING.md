# Development

To work on the SDK generator you need to do the following:

1. Clone this repo using git, you need to have nodejs installed.
2. Run `npm install` in the cloned directory.
3. Run `npm run build:watch`.
4. Run `npm run cli:<browser|node>` to build the SDK from env. You might want to check out [sdk](../sdk) for the locally built SDK.

During development, the SDK will be generated, bundled and stored in the [sdk](../sdk) folder.
In production the root folder will be used.

As of v1.9.0 this repository uses [conventional commit messages](https://conventionalcommits.org).

# Testing

The project uses [Vitest](https://vitest.dev/) as its test framework and tests are divided into generator tests and SDK tests. Generator tests are run on the generator itself, while SDK tests are run on the generated SDK.

## Generator tests

Generator tests are colocated with their source files in the `src/` directory. Each test file is named `<module>.spec.ts` and placed next to the module it tests.

### Writing generator tests

Generator test files should be placed next to the source file they test, within the `src/` directory. Each test file should be named `<module>.spec.ts`. The path aliases from `tsconfig.node.json` (e.g. `@ts/`, `@utils/`) are available in test files via `vitest.config.ts`.

Example (`src/utils/myModule.spec.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { myFunction } from '@utils/myModule';

describe('myFunction', () => {
  it('should return the expected result', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### Running generator tests

```sh
# Run all tests once
$ npm run test:generator

# Run tests with coverage report
$ npm run test:coverage
```

## SDK tests

SDK tests are run against the generated SDK itself. They live in the `test/` directory and are organized by feature and API version.

```
test/
  <feature>/         # e.g. unparameterized, use-query-language, deprecated, target/browser-rx
    <version>/       # e.g. v3
      *.spec.ts
```

Each feature directory corresponds to a SDK generation flag (e.g. `--use-query-language`, `--deprecated`, `--generate-unique`, `--target`). Not all features have tests yet, but new test files will be added over time.

### Writing SDK tests

SDK test files are placed under `test/<feature>/<version>/`, named `<name>.spec.ts` and import directly from the generated SDK via the `@sdk/dist` path alias.

Example (`test/unparameterized/v3/my-feature.spec.ts`):

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { articleService, setGlobalConfig } from '@sdk/dist';

describe('my feature', () => {
  let capturedRequest: Request;

  beforeAll(() => {
    setGlobalConfig({
      host: 'test.example.com',
      secure: true,
      key: 'test-key',
      interceptors: {
        request: (request) => {
          capturedRequest = request;
          return new Response(JSON.stringify({ result: [], referencedEntities: {}, additionalProperties: {} }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
          });
        }
      }
    });
  });

  it('should do something', async () => {
    await articleService().some({});
    const url = new URL(capturedRequest.url);
    expect(url.searchParams.get('someParam')).toBe('expectedValue');
  });

  afterAll(() => {
    setGlobalConfig(undefined);
  });
});
```

### Type checking

Type checking for SDK tests is performed by `tsc` as part of the test run. Because each test run targets a specific set of feature/version folders, the TypeScript config used for type-checking is generated dynamically on the fly by `scripts/run-test-configuration.js` and written to `tsconfig.typecheck-generated.json` before `tsc` and `vitest` are invoked.

The generated file looks like this:

```json
{
  "extends": "./tsconfig.node.json",
  "include": ["test/<feature>/<version>/**/*.spec.ts"]
}
```

`tsconfig.typecheck-generated.json` is checked into the repository as a stub (with an empty `include` array) so that `tsconfig.json` can reference it permanently. This is required for `npm run build` to succeed and for `vite-tsconfig-paths` to correctly resolve the `@sdk/*` path alias at test runtime. The stub is overwritten each time the test script runs and should not be edited manually.

### Running SDK tests

SDK tests are run via `scripts/run-test-configuration.js`, which generates the SDK for the given configuration and then type-checks and runs only the matching test folders.

```sh
# Run the default configuration (v3, browser target, no extra flags)
$ node scripts/run-test-configuration.js --version v3

# Run with a specific target
$ node scripts/run-test-configuration.js --version v3 --target node

# Run with optional feature flags
$ node scripts/run-test-configuration.js --version v3 --use-query-language
$ node scripts/run-test-configuration.js --version v3 --deprecated
$ node scripts/run-test-configuration.js --version v3 --generate-unique

# Flags can be combined
$ node scripts/run-test-configuration.js --version v3 --target browser.rx --use-query-language

# Run the default CI configuration
$ npm run ci:test
```

# Publishing

1. Switch to master branch
2. To make a new version use script `npm run release` in local terminal
   1. For patch `npm run release -- --release-as patch`
   2. For minor `npm run release -- --release-as minor`
   3. For major `npm run release -- --release-as major`
3. The new tag is generated, [CHANGELOG.md](../CHANGELOG.md) updated and changes committed
4. Push to master (don't forget to push tag as well, e.g `git push --follow-tags origin master`)
