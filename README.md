<br/>

<div align="center">
    <h3>weclapp sdk generator</h3>
</div>

<br/>

### Getting started

This is an SDK generator, it will take an [`openapi.json`](https://swagger.io/specification/) from [weclapp](https://weclapp.com/) and build services and types according to the entities defined in it.
What's being generated depends on the weclapp version you're using.

The SDK generator requires the current or LTS version of nodejs, as well as npm v9 or v8.

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
  "scripts": {
    "sdk:generate": "build-weclapp-sdk company.weclapp.com --key [your api key] --cache --target browser",
    "postinstall": "npm run sdk:generate",
  }
}
```

After that, you can import the sdk via `@weclapp/sdk`.
Check out the [docs](docs) for how the generated SDK looks like and how to use it!

### Available flags

| Flag                | Description                                                                   | Value / Type                                 |
|---------------------|-------------------------------------------------------------------------------|----------------------------------------------|
| `--help` / `-h`     | Show help.                                                                    | `boolean`                                    |
| `--version` / `-v`  | Show version of SDK.                                                          | `boolean`                                    |
| `--key` / `-k`      | API Key in case of using a remote.                                            | `string`                                     |
| `--cache` / `-c`    | Extra query params when fetching the openapi.json from a server.              | `boolean`                                    |
| `--from-env` / `-e` | Use env variables `WECLAPP_BACKEND_URL` and `WECLAPP_API_KEY` as credentials. | `boolean`                                    |
| `--target` / `-t`   | Specify the target platform.                                                  | `browser`, `browser-rx`, `node` or `node-rx` |
| `--generate-unique` | Generate additional `.unique` functions.                                      | `boolean`                                    |

### Contributing

Check out the [contributing guidelines](.github/CONTRIBUTING.md).