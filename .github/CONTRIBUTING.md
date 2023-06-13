### Publishing

1. Switch to master branch
2. To make a new version use script `npm run release` in local terminal
    1. For patch `npm run release -- --release-as patch`
    2. For minor `npm run release -- --release-as minor`
    3. For major `npm run release -- --release-as major`
3. The new tag is generated, [CHANGELOG.md](../CHANGELOG.md) updated and changes committed
4. Push to master (don't forget to push tag as well, e.g `git push --follow-tags origin master`)