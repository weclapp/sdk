### Development

To work on the SDK generator you need to do the following:

1. Clone this repo using git, you need to have nodejs installed.
2. Run `npm install` in the cloned directory.
3. Run `npm run build:watch`.
4. Run `npm run cli:<browser|node>` to build the SDK from env. You might want to check out [sdk](../sdk) for the locally built SDK.

During development, the SDK will be generated, bundled and stored in the [sdk](../sdk) folder.
In production the root folder will be used.

As of v1.9.0 this repository uses [conventional commit messages](https://conventionalcommits.org).

### Testing

The project uses [Vitest](https://vitest.dev/) as its test framework. Tests are colocated with their source files in the `src/` directory. Each test file is named `<module>.spec.ts` and placed next to the module it tests.

#### Running tests

```sh
# Run all tests once
$ npm run test

# Run tests with coverage report
$ npm run test:coverage
```

#### Writing tests

Test files should be placed next to the source file they test, within the `src/` directory. Each test file should be named `<module>.spec.ts`.

The path aliases from `tsconfig.node.json` (e.g. `@ts/`, `@utils/`) are available in test files via `vitest.config.ts`.

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

### Publishing

1. Switch to master branch
2. To make a new version use script `npm run release` in local terminal
   1. For patch `npm run release -- --release-as patch`
   2. For minor `npm run release -- --release-as minor`
   3. For major `npm run release -- --release-as major`
3. The new tag is generated, [CHANGELOG.md](../CHANGELOG.md) updated and changes committed
4. Push to master (don't forget to push tag as well, e.g `git push --follow-tags origin master`)
