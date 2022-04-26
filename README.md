<br/>
<br/>

<div align="center">
    <img src="/uploads/1dedf37d0e1e105f9e94ea97e04ca096/logo.svg" alt="Logo" width="350"/>
</div>

<br/>

<div align="center">
    <h3>SDK Generator</h3>
</div>

## Quick start

The following README is about the CLI.

1. Copy the [.env.example](.env.example) to [.env](.env) and configure it accordingly. Make sure to set NODE_ENV to `development`.
2. Run `npm run cli:watch`.
3. Run `npm run sdk:build` to build the SDK from env. You might want to check out [.tmp](.tmp) for the locally built SDK.

> During development the SDK will be build into the [sdk](./sdk) folder, in production the root folder will be used.

> The SDK is first generated into ./.sdk and then cached and moved to the corresponding target directory.
> The package version and content of the swagger.json is used as cache key.

## Documentation

Please refer to the [docs](docs) for how the generated SDK looks like.

## Publishing

Publishing is restricted to project maintainers. To publish component-library to our package registry we need to do the
following steps:

1. Switch to master branch
2. To make a new version use script `npm run release` in local terminal
    1. For patch `npm run release -- --release-as patch`
    2. For minor `npm run release -- --release-as minor`
    3. For major `npm run release -- --release-as major`
3. The new tag is generated, [CHANGELOG.md](CHANGELOG.md) updated and changes committed
4. Push to master (don't forget to push tag as well, e.g `git push --follow-tags origin master`)

Gitlab CI pipeline will automatically publish package to registry with new version number.
