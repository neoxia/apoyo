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
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
