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

## Installation
The package is available on npm under the official [weclapp organization](https://www.npmjs.com/org/weclapp).

Install via npm:
```shell
$ npm install @weclapp/sdk
```

Install via yarn:
```shell
$ yarn add @weclapp/sdk
```

### Quickstart

```ts
import {weclapp} from '@weclapp/sdk';

(async () => {
    const api = weclapp({
        apiKey: '...',
        domain: '...'
    });

    // Fetch amount of customer and log it
    console.log(`Customers: ${await api.customer.count()}`);
})();
```

### Documentation and more

Ready to get started? Head to the API [documentation](docs/api.md) to see how it's done :)
