<br/>
<br/>

<div align="center">
    <img src="./www/logo.svg" alt="Logo" width="350"/>
</div>

<br/>

<div align="center">
    <h3>Weclapp Developer SDK</h3>
</div>


<p align="center">
    <a href="https://www.npmjs.com/package/@weclapp/sdk"><img
        alt="Downloads"
        src="https://img.shields.io/npm/dw/@weclapp/sdk.svg?style=flat-square">
    </a>
    <a href="https://github.com/weclapp/sdk/releases"><img 
        alt="Current version"
        src="https://img.shields.io/github/tag/weclapp/sdk.svg?color=3498DB&label=version&style=flat-square">
    </a>
</p>

### Installation
The package is available on npm under the official [weclapp organization](https://www.npmjs.com/org/weclapp).

Install via npm:
```shell
npm install @weclapp/sdk
```

Install via yarn:
```shell
yarn add @weclapp/sdk
```

### Packages

The weclapp SDK comes with several packages:

| Path | Description | Use case |
| ---- | ----------- | -------- |
| `@weclapp/sdk` | SDK base with promises. | In the browser. |
| `@weclapp/sdk/rx` | Same as the base but with [RxJS](https://rxjs.dev/). | In the browser in combination with [RxJS](https://rxjs.dev/). Mostly for [Angular](https://angular.io/) envieronments. |
| `@weclapp/sdk/node` | NodeJS version, requires [node-fetch](https://www.npmjs.com/package/node-fetch). | In NodeJS. |
| `@weclapp/sdk/node/rx` | NodeJS version with [RxJS](https://rxjs.dev/). | In NodeJS in combination with [RxJS](https://rxjs.dev/). | 


### Quickstart

```ts
import {weclapp} from '@weclapp/sdk';

(async () => {
    const sdk = weclapp({
        apiKey: '...',
        domain: '...'
    });

    // Fetch amount of customer and log it
    console.log(`Customers: ${await sdk.customer.count()}`);
})();
```

### Documentation

Ready to get started? Head to the API [documentation](docs/api.md) to see how it's done :)

### FAQ

#### Types seemed to be incompatible despite their name?

Make sure to always use the types provided for the package you're using.
For example, if you're using the node version (`@weclapp/sdk/node`) you can't use types from `@weclapp/sdk` and vice versa.


Issue:
```ts
import weclapp from '@weclapp/sdk/node';
import {Customer} from '@weclapp/sdk';
const sdk = weclapp({...});

// Error: Customer is not assignable to customer as they're from two
// "different" packages.
const customer: Customer = await sdk.customer.first();
```

Solution:
```ts
import weclapp, {Customer} from '@weclapp/sdk/node';
const sdk = weclapp({...});

// Note that we're now using the same Customer as returned!
const customer: Customer = await sdk.customer.first();
```
