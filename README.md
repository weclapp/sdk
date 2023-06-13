<br/>

<div align="center">
    <h1>weclapp sdk generator</h1>
</div>

### Getting started

This is an SDK generator, it will take an [`openapi.json`](https://swagger.io/specification/) from [weclapp](https://weclapp.com/) and build services and types according to the entities defined in it. 
What's being generated depends on the weclapp version you're using.

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
      "postinstall": "npm runsdk:generate",
   }
}
```

After that, you can import the sdk via `@weclapp/sdk`.
Check out the [docs](docs) for how the generated SDK looks like and how to use it!

### Available flags

| Flag                | Description                                                                   | Value                                        |
|---------------------|-------------------------------------------------------------------------------|----------------------------------------------|
| `-h` / `--help`     | Show help.                                                                    | `boolean`                                    |
| `-v` / `--version`  | Show version of SDK.                                                          | `boolean`                                    |
| `-k` / `--key`      | API Key in case of using a remote.                                            | `string`                                     |
| `-c` / `--cache`    | Extra query params when fetching the openapi.json from a server.              | `boolean`                                    |
| `-e` / `--from-env` | Use env variables `WECLAPP_BACKEND_URL` and `WECLAPP_API_KEY` as credentials. | `boolean`                                    |
| `-t` / `--target`   | Specify the target platform.                                                  | `browser`, `browser-rx`, `node` or `node-rx` |
| `--generate-unique` | Generate additional `.unique` functions.                                      | `boolean`                                    |

### Development

To work on the SDK generator you need to do the following:

1. Run `npm run cli:watch`.
2. Run `npm run sdk:build` to build the SDK from env. You might want to check out [.tmp](.tmp) for the locally built SDK.

During development, the SDK will first be generated into the [.tmp](./.tmp) directory and then bundled and stored in the [sdk](./sdk) folder.
In production the root folder will be used.
