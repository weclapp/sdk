---
name: weclapp-sdk
description: How to use the generated @weclapp/sdk (the output in sdk/dist, produced from this repo's generator). USE FOR — writing application code that imports the generated SDK; calling entity services (some, create, count, update, remove, generic endpoints); building `where` filter expressions with the new query language; building `orderBy` expressions (including CASE/conditional and modifier functions); configuring the SDK (ServiceConfig, global vs per-service config); using select/include/properties/pagination/sort on `some()`; using the `raw()` escape hatch; aborting requests. DO NOT USE FOR — modifying the generator itself (see .github/copilot-instructions.md instead), or the type-map/lookup files (wServices, wEntities, wEnums, etc.) which are intentionally out of scope here.
---

# Using the generated weclapp SDK

This describes how to **consume** the weclapp SDK. It assumes the SDK was generated with
`--use-query-language` (the modern `where` filter, not the legacy `filter`/`or` object).

## Core shape

For every weclapp entity (e.g. `Article`, `Party`) the SDK generates:

- An entity interface: `Article` (properties typed from the OpenAPI schema, may extend a `Base<Entity>`).
- A service factory: `articleService(cfg?: ServiceConfig): ArticleService`.
- A `ArticleService` interface with (at minimum) `some`, `create`, `count`, `update`, `remove`, plus any
  entity-specific generic endpoints (e.g. `postUploadImageById`, `getDownloadImageById`). Not every entity has
  every base function — it depends on which endpoints exist for that entity in the OpenAPI spec.

```ts
import { articleService, setGlobalConfig } from '@weclapp/sdk';

setGlobalConfig({ host: 'company.weclapp.com', secure: true, key: 'my-api-key' });

const article = articleService(); // or articleService({ host, key, ... }) for a per-call config
```

Per-service config always takes precedence over `setGlobalConfig()`.

## Service functions

### `some(query?, requestOptions?)`

Fetch a list of entities. Returns `Promise<{ entities: E[]; references?: ReferencedEntities; properties?: P[] }>`.

Relevant `query` fields:

| Field         | Purpose                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------- |
| `where`       | Typed filter object or raw filter string (see "Filtering" below).                            |
| `sort`        | Simple field sort, e.g. `[{ name: 'asc' }]`. Mutually exclusive with `orderBy`.               |
| `orderBy`     | Advanced ordering (typed object array or raw string). Mutually exclusive with `sort`.         |
| `select`      | Restrict returned properties, e.g. `{ articleNumber: true }`.                                 |
| `include`     | Request that certain reference IDs be resolved into `references` (entity-specific shape).     |
| `properties`  | Request additional computed properties (entity-specific, e.g. `['averagePrice']` on Article). |
| `pagination`  | `{ page: number; pageSize: number }`. Default page size is 100, max is 1000.                  |
| `serializeNulls` | Whether `null` values should be serialized.                                                |

```ts
const { entities } = await article.some({
  where: { articleNumber: { EQ: 'ART-001' } },
  orderBy: [{ FIELD: { name: true }, SORT: 'asc' }],
  select: { articleNumber: true, name: true },
  pagination: { page: 1, pageSize: 50 }
});
```

### `count(query?, requestOptions?)`

Same `where` filtering as `some`, no sort/orderBy/select/pagination. Returns `Promise<number>`.

```ts
const total = await article.count({ where: { active: { EQ: true } } });
```

### `create(data, requestOptions?)`

`data: DeepPartial<Article>` → `Promise<Article>`.

### `update(id, data, options?, requestOptions?)`

`data: DeepPartial<Article>`, `options?: { ignoreMissingProperties?: boolean; dryRun?: boolean }` → `Promise<Article>`.

### `remove(id, options?, requestOptions?)`

`options?: { dryRun?: boolean }` → `Promise<void>`.

### `unique(id, query?, requestOptions?)` (only if generated with `--generate-unique`)

Fetches a single entity by id directly (`GET /entity/id/{id}`), `query?: { serializeNulls?: boolean }`.

### Generic/custom endpoints

Some entities expose additional endpoints beyond the CRUD base (named after their path, e.g.
`postUploadImageById`, `getDownloadArticleImageById`, `postChangeUnitById`). Signature pattern:

```ts
// with an :id path segment
serviceFn.someCustomById(id: string, query: Service_SomeCustom_Query, requestOptions?) => Promise<T>;
// without an :id path segment
serviceFn.someCustom(query: Service_SomeCustom_Query, requestOptions?) => Promise<T>;
```

`query` bundles both `params` (query string params) and `body` (request body), depending on the underlying
HTTP method — inspect the generated `*_Query` type for the exact shape. Endpoints that return binary data
resolve to `Blob` (browser target) or a binary-friendly type on node targets.

All functions accept a trailing `requestOptions?: { signal?: AbortSignal }` for cancellation (see "Aborting a
request" below).

## Filtering with `where` (query language)

`where` accepts either a typed `QueryFilter<EntityFilter>` object, or a raw filter string that is passed through
as-is (use this for expressions the type system can't express, e.g. arithmetic).

Basic comparison — properties are ANDed together implicitly:

```ts
article.some({
  where: {
    articleNumber: { EQ: 'ART-001' },
    active: { EQ: true }
  }
});
// -> articleNumber = "ART-001" and active = true
```

Available operators per field: `EQ`, `NE`, `LT`, `GT`, `LE`, `GE`, `LIKE`, `IN` (array of values), `NULL`
(boolean), and on array/enum-array fields `CONTAINS` (single value or array — multiple values are ORed).
Modifier flags `LOWER` / `TRIM` can be set alongside an operator to transform the property before comparing.

```ts
article.some({
  where: { name: { LIKE: '%test%', LOWER: true } }
});
// -> lower(name) ~ "%test%"
```

Nested/related entity properties are addressed by nesting the filter object (dot-path is built automatically):

```ts
article.some({
  where: { articlePrices: { price: { GT: 100 } } }
});
// -> articlePrices.price > 100
```

Boolean combinators — `AND`, `OR`, `NOT`, and conditional `CASE`:

```ts
article.some({
  where: {
    AND: [
      { OR: [{ name: { LIKE: '%test%', LOWER: true } }, { articleNumber: { LIKE: '%345%' } }] },
      { batchNumberRequired: { EQ: true } }
    ]
  }
});
```

```ts
article.some({
  where: { NOT: { active: { EQ: true } } }
});
```

```ts
article.some({
  where: {
    CASE: {
      IF: { active: { EQ: true } },
      THEN: { articleNumber: { LIKE: '%A%' } },
      ELSE: { articleNumber: { LIKE: '%B%' } }
    }
  }
});
```

`LENGTH` can be used as an operator to filter/compare on the length of a value:

```ts
article.some({
  where: { name: { LENGTH: { GT: 5 } } }
});
// -> length(name) > 5
```

Empty `IN`/`CONTAINS` arrays are valid — they compile to the always-false expression `1 = 0` (the API itself
rejects an empty `IN (...)`  list).

Raw string escape hatch, useful for expressions the type system doesn't support (e.g. arithmetic on
properties), combined with the typed form (they are ANDed):

```ts
article.some({ where: '(articleLength * articleWidth * articleHeight) <= 3000' });
```

## Sorting

Two mutually exclusive ways to order `some()` results:

- `sort`: simple, e.g. `sort: [{ name: 'asc' }, { minimumPurchaseQuantity: 'desc' }]`.
- `orderBy`: advanced ordering, typed object array or raw string (see below). Setting one disallows the other
  at the type level.

## Ordering with `orderBy`

Each entry is either a `FieldOrderBy` or a `ConditionalOrderBy`.

`FieldOrderBy`: `{ FIELD: OrderableField<Entity>; SORT?: 'asc' | 'desc'; LOWER?: boolean; TRIM?: boolean; LENGTH?: boolean }`.
`FIELD` is a nested "select-one-key-per-level" object, e.g. `{ FIELD: { name: true } }` or, for nested/array
properties, `{ FIELD: { articlePrices: { price: true } } }` (compiles to dot-path `articlePrices.price`).
`SORT` defaults to `asc` when omitted.

```ts
article.some({ orderBy: [{ FIELD: { createdDate: true }, SORT: 'asc' }] });
// ?orderBy=createdDate asc

article.some({
  orderBy: [{ FIELD: { createdDate: true } }, { FIELD: { articleNumber: true }, SORT: 'desc' }]
});
// ?orderBy=createdDate asc, articleNumber desc
```

Modifiers apply on the field before sorting, and can be combined:

```ts
party.some({
  orderBy: [
    { FIELD: { lastName: true }, LENGTH: true, TRIM: true, SORT: 'desc' },
    { FIELD: { firstName: true } }
  ]
});
// ?orderBy=length(trim(lastName)) desc, firstName asc
```

`ConditionalOrderBy`: `{ CASE: { WHEN: QueryFilter<F>; THEN: number | FieldOrderBy<F> }[]; ELSE: number | FieldOrderBy<F>; SORT?: 'asc' | 'desc' }`.
`WHEN` is a normal `where`-style filter. `THEN`/`ELSE` are either a literal rank (`number`) or a `FieldOrderBy`
to fall back to field-based ordering.

```ts
article.some({
  orderBy: [
    {
      CASE: [
        { WHEN: { internalNote: { NULL: false } }, THEN: 1 },
        { WHEN: { packagingQuantity: { GT: 400 } }, THEN: 2 }
      ],
      ELSE: 3,
      SORT: 'asc'
    },
    { FIELD: { articleNumber: true } }
  ]
});
// ?orderBy=(not internalNote null) ? 1 : (packagingQuantity > 400) ? 2 : 3 asc, articleNumber asc
```

Raw string is also accepted directly: `orderBy: 'articleNumber desc'`.

## select / include / properties

- `select` — restrict which properties are returned, mirroring the entity's shape with `boolean` leaves, e.g.
  `select: { articleNumber: true, articlePrices: { price: true } }`.
- `include` — an entity-specific object (`XService_Some_References`) whose boolean flags request that certain
  reference/id fields be resolved and returned in the `references` part of the `some()` result.
- `properties` — an entity-specific array of literal names (`XService_Some_AdditionalPropertyNames`, e.g.
  `['averagePrice', 'totalStockQuantity']` for `Article`) requesting extra computed values, returned under
  `properties` in the `some()` result, typed via `XService_Some_AdditionalProperties`.

## Pagination

```ts
article.some({ pagination: { page: 2, pageSize: 10 } });
```

Default page size is 100 entities; max `pageSize` is 1000.

## Configuration (`ServiceConfig`)

```ts
interface ServiceConfig {
  key?: string; // API key; omit to use cookie auth in a browser
  host?: string; // defaults to location.host in a browser
  secure?: boolean; // https vs http; defaults to location.protocol in a browser
  multiRequest?: boolean; // bundle some()/count() calls into a single multi-request
  ignoreMissingProperties?: boolean; // default for update() calls
  usePost?: boolean; // use POST instead of GET for some()/count()
  interceptors?: {
    request?: (request: Request, payload: RequestPayload) => Request | Response | void | Promise<...>;
    response?: (response: Response) => Response | void | Promise<Response | void>;
  };
}
```

Use `setGlobalConfig(cfg)` once (e.g. at app bootstrap) or pass a config directly to a service factory
(`articleService(cfg)`); a config passed per-service always wins over the global one.

When `usePost` is enabled, `where`/`orderBy`/`select`/`pagination` are sent in the POST body instead of as
query string params (useful for very large filter expressions).

## The `raw()` escape hatch

For anything not covered by a generated service function:

```ts
import { raw } from '@weclapp/sdk';

const result = await raw(cfg /* ServiceConfig | undefined */, endpoint /* e.g. '/article' */, {
  method: 'GET', // default GET
  query: {}, // query string params
  body: undefined, // request body
  unwrap: false, // extract `.result` from the response body if true
  forceBlob: false // force treating the response as a Blob (needed for downloads)
});
```

## Aborting a request

Every generated function accepts a trailing `requestOptions?: { signal?: AbortSignal }`:

```ts
const controller = new AbortController();

articleService()
  .count({ where: { active: { EQ: true } } }, { signal: controller.signal })
  .catch((err) => {
    if (controller.signal.aborted) {
      console.log('aborted:', controller.signal.reason);
    } else {
      throw err;
    }
  });

controller.abort('no longer needed');
```
