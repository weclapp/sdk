## Exported utilities

| Interface         | Description                                                     |
|-------------------|-----------------------------------------------------------------|
| `WeclappEntity`   | A tuple with all entities in camelCase.                         |
| `WeclappServices` | A map from `WeclappEntity` to its corresponding service.        |
| `weclappService`  | An object with `WeclappEntity` as key and the service as value. |

## Usage

This SDK is split into services. Each service is responsible for a _single_ entity (e.g. `Party`). Every service contains all functions available for this
entity, this may include functions such as `update`, `delete`, `some` and many more.

To initialize a service a `ServiceConfig` is needed, you can specify a global config in case you don't want to pass the config every time to the service you
want to use manually.

### The Service Configuration

The configuration looks like the following (taken from [root.ts](/src/generator/01-base/static/root.ts.txt)):

```ts
interface ServiceConfig {

    // Your API-Key, this is optional in the sense of if you omit this and you're in a browser the 
    // cookie-authentication (include-credentials) will be used.
    key?: string;

    // Your domain, if omitted location.host will be used.
    domain?: string;

    // If you want to use https, defaults to true.
    secure?: boolean;

    // Optional request/response interceptors.
    interceptors?: {

        // Takes the generated request, you can either return a new request,
        // a response (which will be taken as "the" response) or nothing.
        request?: (request: Request) => Request | Response | void;

        // Takes the response. This can either be the one from the server or an 
        // artificially-crafted one by the request intercptor.
        response?: (response: Response) => Response | void;
    };
}
```

There are two ways to use each service:

#### Using a Global Config

```ts
import {setGlobalConfig, partyService} from '@weclapp/sdk';

setGlobalConfig({
    key: 'mykey',
    domain: 'myweclapp.com'
});

const party = partyService();

console.log(`Total amount of parties: ${await party.count()}`)
```

#### Using a Config per Service

```ts
import {partyService} from '@weclapp/sdk';

const party = partyService({
    key: 'mykey',
    domain: 'myweclapp.com'
});

console.log(`Total amount of parties: ${await party.count()}`)
```

> If a global config is specified as well the one passed to the service will **always** take precedence over the global one!
