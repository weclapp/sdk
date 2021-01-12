<br/>
<br/>

<div align="center">
    <img src="/uploads/1dedf37d0e1e105f9e94ea97e04ca096/logo.svg" alt="Logo" width="350"/>
</div>

<br/>

<div align="center">
    <h3>SDK Generator</h3>
</div>


## Project structure

Most of them are auto-generated.

| Folder | Description |
| ----- | ----- |
| [/static](static) | Static files, most of them (!) will be copied straight to the sdk repository itself. |
| [/src](src) | Source code for the generator itself. |
| [/lib](lib) | Will containt the raw source files generated by the generator.  |
| [/sdk](sdk) | The generated repository will end up here. Source-files are bundle via [rollup](https://rollupjs.org/). |
| [/coverage](coverage) | After running tests, you can find your coverage files from [jest](https://jestjs.io/en/) here. |

## Setup

Copy the [.env.example](.env.example) to [.env](.env) and configure it accordingly. Use the [swagger editor](https://editor.swagger.io/) to convert your
swagger.json to the [OpenAPI v3](https://swagger.io/specification/) format.

### Development

There are a few scripts during development:

* `npm run gen:dev` _- Watches the generator's content files and re-generates the SDK on every change._
* `npm run sdk:dev` _- Watches the SDK itself and bundles it every time to be used in, for example, tests._
* `npm run lint:fix` _- Lints both the generator, and the generated sdk. Fixes errors where possible._
* `npm run test:coverage` _- Test the SDK and collect code-coverage._

The former two are started separetly, as errors may occur independently of each other.

To use your freshly created sdk, you can refer to it locally to test it (replace `SDK_PATH` with the absolute path of [sdk](sdk)): 
```json5
{
    // ...inside of your package.json
    "dependencies": {
        "@weclapp/sdk": "file:SDK_PATH",
        // ...other dependencies...
    }
}
```

### Production

To generate a production-ready SDK, simply run `npm run build`. This will generate the SDK and bundle it into the [sdk](sdk) folder. The process should finish without
errors.

