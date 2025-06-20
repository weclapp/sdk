<br/>

<div align="center">
    <h1>weclapp sdk generator</h1>
</div>

<br/>

# Introduction

This is an SDK generator, it will take an [`openapi.json`](https://swagger.io/specification/) from [weclapp](https://weclapp.com/) and build services and typescript types according to the entities defined in it. Each service is responsible for a _single_ entity. Every service contains all functions available for this
entity, this may include functions such as `update`, `remove`, `some` and many more. With these functions you can send requests to your weclapp system to get data or manipulate them.

An entity is a resource with properties in weclapp. This can be an article, a contract or a quotation. The SDK generates a well-defined typescript type for each entity and its property. In this way, the SDK makes it possible to work with the data retrieved via the API in a type-safe manner.

Check out [generated types and utilities](#generated-types-and-utilities) for more possibilities!

What's being generated depends on the weclapp version you're using.

# Getting started

The SDK generator requires the current or LTS version of nodejs, as well as npm v10.

You can install the generator via the package manager of your choice:

```sh
$ npm install --save-dev @weclapp/sdk
```

And build the sdk via:

```sh
$ npx build-weclapp-sdk company.weclapp.com --key [your api key]
```

It is recommended to add the build script to the [postinstall](https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-operation-order)-script in your package.json.
This way, every time someone installs or updates dependencies, the SDK is generated:

```json5
{
  // in your package.json
  scripts: {
    'sdk:generate': 'build-weclapp-sdk company.weclapp.com --key [your api key] --cache --target browser',
    postinstall: 'npm run sdk:generate'
  }
}
```

## Available flags

| Flag                   | Description                                                                                                                                              | Value / Type                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `--cache` / `-c`       | Extra query params when fetching the openapi.json from a server.                                                                                         | `boolean`                                    |
| `--deprecated` / `-d`  | Include deprecated functions and services.                                                                                                               | `boolean`                                    |
| `--from-env` / `-e`    | Use env variables `WECLAPP_BACKEND_URL` and `WECLAPP_API_KEY` as credentials.                                                                            | `boolean`                                    |
| `--generate-unique`    | Generate additional `.unique` functions.                                                                                                                 | `boolean`                                    |
| `--use-query-language` | Use the advanced query language. The property _filter_ will be removed from _SomeQuery_ and _CountQuery_ and the property _where_ will be added instead. | `boolean`                                    |
| `--help` / `-h`        | Show help.                                                                                                                                               | `boolean`                                    |
| `--key` / `-k`         | API Key in case of using a remote.                                                                                                                       | `string`                                     |
| `--target` / `-t`      | Specify the target platform.                                                                                                                             | `browser`, `browser.rx`, `node` or `node.rx` |
| `--query` / `-q`       | Extra query params when fetching the openapi.json from a server                                                                                          | `string`                                     |
| `--version` / `-v`     | Show version of SDK.                                                                                                                                     | `boolean`                                    |

After that, you can import the sdk via `@weclapp/sdk`.
Check out the [docs](docs) for how the generated SDK looks like and how to use it!

# Initialization

To initialize a service a `ServiceConfig` is needed, you can specify a global config in case you don't want to pass the config every time to the service you
want to use manually. If you pass an empty object as ServiceConfig the [location](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) will be used to get the domain and the protocol (secure config option).

## The Service Configuration

The configuration looks like the following (taken from [globalConfig.ts](/src/generator/01-base/static/globalConfig.ts.txt)):

```ts
interface ServiceConfig {
  // Your API-Key, this is optional in the sense of if you omit this, and you're in a browser, the
  // cookie-authentication (include-credentials) will be used.
  key?: string;

  // Your domain, if omitted location.host will be used.
  domain?: string;

  // If you want to use https, defaults to false.
  secure?: boolean;

  // If you want that some and count requests are bundled into multi requests.
  multiRequest?: boolean;

  // If you want that the ignoreMissingProperties parameter to be set for each post request.
  ignoreMissingProperties?: boolean;

  // Optional request/response interceptors.
  interceptors?: {
    // Takes the generated request, you can either return a new request,
    // a response (which will be taken as "the" response) or nothing.
    // The payload contains the raw input generated by the SDK.
    request?: (
      request: Request,
      payload: RequestPayload
    ) => Request | Response | void | Promise<Request | Response | void>;

    // Takes the response. This can either be the one from the server or an
    // artificially-crafted one by the request interceptor.
    response?: (response: Response) => Response | void | Promise<Response | void>;
  };
}
```

### Usage

There are three ways of accessing a service through the SDK:

#### Using a Global Config

```ts
import { setGlobalConfig, partyService } from '@weclapp/sdk';

setGlobalConfig({
  key: 'mykey',
  domain: 'myweclapp.com'
});

const party = partyService();

console.log(`Total amount of parties: ${await party.count()}`);
```

#### Using a Config per Service

```ts
import { partyService } from '@weclapp/sdk';

const party = partyService({
  key: 'mykey',
  domain: 'myweclapp.com'
});

console.log(`Total amount of parties: ${await party.count()}`);
```

> If a global config is specified as well the one passed to the service will **always** take precedence over the global one!

#### Using the raw function

The raw function can be used if none of the provided function suits your needs. The services use the raw function, which makes the API requests via [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

```ts
import { raw } from '@weclapp/sdk';

const result = await raw(
    cfg: ServiceConfig | undefined = globalConfig,
    endpoint: string,
    payload: RequestPayload = {}
);
```

where `RequestPayload` looks like this:

```ts
interface RequestPayload {
  method?: RequestPayloadMethod; // Optional request method, default is GET
  query?: Record<string, any>; // Optional query parameters
  body?: any; // Optional body

  // In case the response body is an object with a result-prop the value will be extracted
  unwrap?: boolean;

  // If in any case the response should be returned as a blob.
  // Required for download endpoints as json will be parsed automatically.
  forceBlob?: boolean;
}
```

# Generated types and utilities

The generator generates various utilities that can be used to integrate it in a generic way into your app.

## Exported constants

| Constant                    | Description                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `wServiceWith[method]Names` | An array of services (strings) that have this function. Example: `wServiceWithUpdateNames`.                            |
| `wCustomValueServiceNames`  | An array of services (strings) that work with `CustomValue`.                                                           |
| `wEnums`                    | Object with the name of the enum as key and the corresponding enum as value.                                           |
| `wServiceFactories`         | Object with all services where the name is the key and the value a function taking a config and returning the service. |
| `wServices`                 | Object with all services where the name is the key and the value the service (that is using the global config).        |
| `wEntityProperties`         | Object with all entity names as key and properties including the type and format as value.                             |

## Exported types

| Type                    | Description                                                                                                 | Type guards available?                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `WServiceWith[method]`  | A tuple of strings with the names of the services that contain this function. Example: `WServiceWithSome`.  | Yes, for example `isWServiceWithSome` |
| `WServicesWith[method]` | An interface with the service-name as key and corresponding service as value. Example: `WServicesWithSome`. |                                       |
| `WCustomValueService`   | Tuple of services (strings) that work with `CustomValue`.                                                   | Yes: `isWCustomValueService`          |
| `WEnums`                | Type of `wEnums`.                                                                                           |                                       |
| `WEnum`                 | All keys of `WEnums`.                                                                                       |                                       |
| `WEntities`             | Interface will all entities from weclapp with their name as key and type as value                           |                                       |
| `WEntity`               | All keys of `WEntities`.                                                                                    |                                       |
| `WServiceFactories`     | Type of `wServiceFactories`.                                                                                |                                       |
| `WServices`             | Type of `wServices`.                                                                                        |                                       |
| `WEntityProperties`     | Generalized type of `wEntityProperties`.                                                                    |                                       |

# Services and Raw in depth

As already described above, the api endpoints can be requested via services or the raw function. The advantage of wServices over the raw function is that all endpoints of the entities are available as functions and these functions are typed. This makes it easier to work with the data provided via the weclapp API.

A service of an entity has in general the following base function:

    some: // get entity data
    create: // creates a entity
    count: // get the count of entities
    remove: // deletes a entity
    update: // updates a entity

In addition there are some custom endpoint functions. The generated PartyService is shown below as an example:

```ts
interface PartyService {
  some: PartyService_Some;
  create: PartyService_Create;
  count: PartyService_Count;
  remove: PartyService_Remove;
  update: PartyService_Update;
  postCreatePublicPageById: PartyService_PostCreatePublicPageById;
  getDownloadImageById: PartyService_GetDownloadImageById;
  getTopPurchaseArticlesById: PartyService_GetTopPurchaseArticlesById;
  getTopSalesArticlesById: PartyService_GetTopSalesArticlesById;
  postUploadImageById: PartyService_PostUploadImageById;
}
```

## Comparison

```ts
import { PartyType, setGlobalConfig, wServices } from '@weclapp/sdk';

setGlobalConfig({
  domain: 'company.weclapp.com',
  secure: true
});

// to get the count of parties via service
const serviceN = await wServices['party'].count();

// to get the count of parties via raw
const rawN = await raw(undefined, '/party/count');

// to get all parties via service
const partiesService = await wServices['party'].some();

// to get all parties via raw
const partiesRaw = await raw(undefined, '/party');

// to create a party via service
const contact = await wServices['party'].create({
  partyType: PartyType.PERSON,
  lastName: 'Mueller'
}); // the returned object is already typed as Party

// to create a party via raw
const contactRaw = await await raw(undefined, '/party', {
  // the returned object has the type any.
  method: 'POST',
  body: { partyType: PartyType.PERSON, lastName: 'Mueller' }
});

// to delete a party via service
await wServices['party'].remove(contact.id);

// to delete a party via raw
if (contactRaw && typeof contactRaw.id === 'string') {
  await raw(undefined, `/party/id/${contactRaw.id}`, {
    method: 'DELETE'
  });
}
```

## Service request arguments

### Filtering

With the some and count functions you can filter the requested data.

```ts
wServices['article'].some({
  filter: {
    name: { EQ: 'toy 1' },
    articleNumber: { EQ: '12345' }
  }
});
```

The SDK makes an AND operator between the properties. So this equivalent to the follwing expression:

    name EQ 'toy 1' AND articleNumber EQ '12345'.

If you want an OR operator you have to set an array in the or property:

```ts
wServices['article'].some({
  or: [
    {
      name: { EQ: 'toy 1' },
      articleNumber: { EQ: '12345' }
    }
  ]
});
```

The above example is the equivalent of the expression

    name EQ 'toy 1' OR articleNumber EQ '12345'.

To combine OR and AND clauses, you can also group OR expressions by adding several objects to the array:

```ts
wServices['article'].some({
  or: [
    {
      name: { EQ: 'toy 1' },
      articleNumber: { EQ: '12345' }
    },
    {
      batchNumberRequired: { EQ: true }
    }
  ]
});
```

This is evaluated to:
(name EQ 'toy 1' OR articleNumber EQ '12345') AND batchNumberRequired EQ true

### Where filter

<strong>Warning: This is still a beta feature.</strong>

It is also possible to specify complex filter expressions that can combine multiple conditions and express relations between properties:

```ts
wServices['article'].some({
  where: {
    AND: [
      {
        OR: [{ name: { LIKE: '%test%', lower: true } }, { articleNumber: { LIKE: '%345%' } }]
      },
      { batchNumberRequired: { EQ: true } }
    ]
  }
});
```

"where" parameters are ANDed with other filter parameters.

### Sort

You can sort your requested data with an array properties.

```ts
wServices['article'].some({
  sort: [{ name: 'asc' }, { minimumPurchaseQuantity: 'desc' }]
});
```

Sort by name (ascending) and then minimumPurchaseQuantity descending.

### Pagination

By default the API returns only the first 100 entities. You can increase the size of one response to the maximum of 1000. To get the next 1000 entities you have increase the page number.

```ts
wServices['article'].some({
  pagination: {
    page: 2,
    pageSize: 10
  }
});
```

This returns the first 10 articles of the second page.

### Select

With the select option you can fetch specific subset of properties:

```ts
wServices['article'].some({
  select: { articleNumber: true }
});
```

This only returns the articleNumber property of all articles.

# Enums

The generated enums are a good posibility to check if an entity is of a specific type. For example, you can get all articles of a certain article type:

```ts
wServices['article'].some({
  filter: {
    articleType: { EQ: ArticleType.STORABLE }
  }
});
```

# Contributing

Check out the [contributing guidelines](.github/CONTRIBUTING.md).
