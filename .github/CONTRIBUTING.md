### Development

To work on the SDK generator you need to do the following:

1. Clone this repo using git, you need to have nodejs installed.
2. Run `npm install` in the cloned directory.
3. Run `npm run build:watch`.
4. Run `npm run cli:<browser|node>` to build the SDK from env. You might want to check out [sdk](../sdk) for the locally built SDK.

During development, the SDK will be generated, bundled and stored in the [sdk](../sdk) folder.
In production the root folder will be used.

As of v1.9.0 this repository uses [conventional commit messages](https://conventionalcommits.org).

### Publishing

1. Switch to master branch
2. To make a new version use script `npm run release` in local terminal
   1. For patch `npm run release -- --release-as patch`
   2. For minor `npm run release -- --release-as minor`
   3. For major `npm run release -- --release-as major`
3. The new tag is generated, [CHANGELOG.md](../CHANGELOG.md) updated and changes committed
4. Push to master (don't forget to push tag as well, e.g `git push --follow-tags origin master`)
