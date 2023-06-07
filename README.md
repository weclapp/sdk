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
$ npx sdk-generator company.weclapp.com --key [your api key]
```

It is recommended to add the build script to the [postinstall](https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-operation-order)-script in your package.json.
This way, every time someone installs or updates dependencies, the SDK is generated:

```json5
{
   // in your package.json
   "scripts": {
      "sdk:generate": "sdk-generator company.weclapp.com --key [your api key] --cache --target browser",
      "postinstall": "npm runsdk:generate",
   }
}
```

After that, you can import the sdk via `@weclapp/sdk`.
Check out the [docs](docs) for how the generated SDK looks like and how to use it!
You can run `npx sdk-generator --help` for more options :)

### Development

To work on the SDK generator you need to do the following:

1. Run `npm run cli:watch`.
2. Run `npm run sdk:build` to build the SDK from env. You might want to check out [.tmp](.tmp) for the locally built SDK.

During development the SDK will be built into the [sdk](./sdk) folder, in production the root folder will be used.
The SDK is first generated into ./.sdk and then cached and moved to the corresponding target directory.

### Publishing

Publishing is restricted to project maintainers.

1. Switch to master branch
2. To make a new version use script `npm run release` in local terminal
   1. For patch `npm run release -- --release-as patch`
   2. For minor `npm run release -- --release-as minor`
   3. For major `npm run release -- --release-as major`
3. The new tag is generated, [CHANGELOG.md](CHANGELOG.md) updated and changes committed
4. Push to master (don't forget to push tag as well, e.g `git push --follow-tags origin master`)
