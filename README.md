<br/>
<br/>

<div align="center">
    <img src="/uploads/1dedf37d0e1e105f9e94ea97e04ca096/logo.svg" alt="Logo" width="350"/>
</div>

<br/>

<div align="center">
    <h3>SDK Generator</h3>
</div>

#### Setup

Copy the [.env.example](.env.example) to [.env](.env) and configure it accordingly. Use the [swagger editor](https://editor.swagger.io/) to convert your
swagger.json to the [OpenAPI v3](https://swagger.io/specification/) format.

##### Development

There are a few scripts during development:

* `npm run gen:dev` _- Watches the generator's content files and re-generates the SDK on every change._
* `npm run sdk:dev` _- Watches the SDK itself and bundles it every time to be used in, for example, tests._
* `npm run lint:fix` _- Lints both the generator, and the generated sdk. Fixes errors where possible._
* `npm run test:coverage` _- Test the SDK and collect code-coverage._

The former two are started separetly, as errors may occur independently of each other.

##### Production

To generate a production-ready SDK, simply run `npm run build`. This will generate the SDK and bundle it into the lib folder. The process should finish without
errors.

