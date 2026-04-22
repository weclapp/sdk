# Copilot Instructions — @weclapp/sdk

## Project Overview

This is an **SDK code generator** that reads an OpenAPI 3 spec from weclapp and produces a fully typed, bundled TypeScript SDK. It does **not** contain runtime SDK code directly — it generates it as strings, then bundles via Rollup.

## Architecture

The pipeline is: **CLI → Parse OpenAPI → Generate TypeScript (as strings) → Bundle with Rollup**.

Entry point: `src/index.ts` orchestrates the full flow: parse CLI args → call `generate()` → write to `sdk/src/index.ts` → bundle → output to `sdk/dist/`.

### Generator Phases (`src/generator/`)

Phases execute sequentially and are **numbered by convention** — ordering matters:

1. **`01-base/`** — Static runtime code (request helpers, config, query types). Loaded from `.ts.txt` template files as raw strings via a custom Rollup `txt` plugin.
2. **`02-enums/`** — Generates TypeScript enums from OpenAPI string schemas with `enum` arrays.
3. **`03-entities/`** — Generates interfaces for each entity + filter interfaces from schema properties.
4. **`04-services/`** — Generates service functions (`some`, `create`, `count`, `remove`, `update`, plus generics) per entity based on endpoint paths.
5. **`05-maps/`** — Generates lookup maps, type guards, and constants (`wServices`, `wEnums`, `wEntities`, etc.).

All generated code is concatenated via `generateStatements()` into a single `index.ts`, then bundled.

### Key Abstractions

- **`OpenApiContext`** (`src/utils/weclapp/extractContext.ts`) — Parsed OpenAPI doc into Maps of endpoints, schemas, responses, parameters, aliases. All generator phases consume this.
- **`Target`** (`src/target.ts`) — Four build targets: `browser`, `browser.rx`, `node`, `node.rx`. Affects imports (rxjs), response types (`Promise` vs `Observable`), and binary types (`Blob` vs `Buffer`).
- **`WeclappEndpointType`** (`src/utils/weclapp/parseEndpointPath.ts`) — Classifies endpoints: `ROOT`, `COUNT`, `ENTITY`, `GENERIC_ROOT`, `GENERIC_ENTITY`.

## Code Generation Pattern

TypeScript code is generated as **strings**, not AST. The `src/ts/` directory contains string-builder helpers:

- `generateInterface()`, `generateEnum()`, `generateType()`, `generateArrowFunction()`, etc.
- `generateStatements()` joins trimmed non-empty strings with double newlines.
- `generateBlockStatements()` wraps in braces with indentation.

When adding a new TS code generator, follow the pattern in `src/ts/` — export a pure function that returns a string.

## Path Aliases

The project uses TypeScript path aliases extensively (configured in `tsconfig.node.json`):

- `@logger` → `src/utils/logger.ts`
- `@generator/*` → `src/generator/*`
- `@utils/*` → `src/utils/*`
- `@ts/*` → `src/ts/*`
- `@/*` → project root

Always use these aliases in imports, never relative paths that cross directory boundaries.

## Static Templates

Files in `src/generator/01-base/static/*.ts.txt` are raw TypeScript strings imported as default exports (via the custom Rollup `txt` plugin + `globals.d.ts` declaration). They contain the SDK's runtime code (fetch wrappers, query builders). Edit these as plain TypeScript, but know they are treated as opaque strings at build time.

## Commands

| Task                      | Command                                              |
| ------------------------- | ---------------------------------------------------- |
| Build CLI                 | `npm run build`                                      |
| Run tests                 | `npm test`                                           |
| Lint                      | `npm run lint`                                       |
| Format check              | `npm run prettier`                                   |
| Full CI check             | `npm run ci`                                         |
| Generate SDK (local file) | `./bin/cli.js test/openapi_v3.json --target browser` |

## Testing

- **Framework**: Vitest with globals enabled (no need to import `describe`/`it`/`expect` — but current specs do import from `vitest` explicitly).
- **Spec location**: Co-located as `*.spec.ts` next to the source file (e.g., `generateEnum.ts` → `generateEnum.spec.ts`).
- **Pattern**: Tests call the string-builder function and assert on the output string using `toContain` / `toBe`.
- Test files live only in `src/`, never in `test/` (that directory holds sample OpenAPI fixtures).

## Style & Conventions

- **Prettier**: 120 char width, single quotes, no trailing commas.
- **ESLint**: `no-console` is an error — use the `logger` singleton from `@logger` instead.
- **Case utility**: Use `loosePascalCase` from `@utils/case` instead of `pascalCase` from `change-case` for entity names — it preserves casing like `cDBReminderType` → `CDBReminderType`.
- **Naming**: Services use `camelCase` for function names (`articleService`) and `PascalCase` for type names (`ArticleService`). Generated type sub-names follow `ServiceName_FunctionName` pattern (e.g., `PartyService_Some`).

## Important Gotchas

- The `sdk/` directory is **generated output** — never edit files there manually; they are deleted and regenerated on each build.
- The project uses ESM (`"type": "module"`) throughout with `import ... with { type: 'json' }` for JSON imports.
- Rollup config uses `tsconfig.node.json`; the generated SDK uses `tsconfig.sdk.json`.
