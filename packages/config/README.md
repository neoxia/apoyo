# Apoyo - Config

[![npm version](https://badgen.net/npm/v/@apoyo/config)](https://www.npmjs.com/package/@apoyo/config)

**Warning**: This package is still unstable! The API may still change!

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/config`

## Documentation

The `config` package series contains utils to facilitate loading your application parameters from different providers (env, aws ssm, gcp secret manager, etc...).

A more complete documentation will be made available once the API has stabilized itself.

## Usage

```ts
import { getParametersFromEnvironment, AppParameters } from '@apoyo/config'
import { getParametersFromSSM } from '@apoyo/config-ssm'

async function getAppParameters(): AppParameters {
  const envParams = await getParametersFromEnvironment({
    nodeEnv: process.env.NODE_ENV,
    path: process.cwd()
  })

  const ssmEnabled = envParams['AWS_SSM_ENABLED'] === 'true' ? true : false

  const ssmParams = ssmEnabled
    ? await getParametersFromSSM({
        prefix: envParams['AWS_SSM_PREFIX'],
        key: envParams['AWS_ACCESS_KEY_ID'],
        secret: envParams['AWS_SECRET_ACCESS_KEY'],
        region: envParams['AWS_REGION']
      })
    : {}

  // Merge parameters from env and ssm
  const appParams: AppParameters = {
    ...envParams,
    ...ssmParams
  }

  return appParams
}
```

Once these parameters are loaded, you can use them instead of a hard-coded `process.env` to configure your services:

```ts
import { AppParameters } from '@apoyo/config'
import assert from 'assert'

async function configureHttp(parameters: AppParameters) {
  // Note: You still need to validate the parameters using the validation library of your choice.

  assert(parameters.PORT, 'The parameter PORT should be defined')

  const port = parseInt(parameters.PORT)

  assert(!isNaN(port) && port > 0, 'The parameter PORT should be a positive integer')

  return {
    port
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
