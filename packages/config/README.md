# Apoyo - Config

[![npm version](https://badgen.net/npm/v/@apoyo/config)](https://www.npmjs.com/package/@apoyo/config)

**Warning**: This package is still unstable! The API may still change!

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/config`

## Documentation

This package contains utils to facilitate loading your application parameters (env, ssm, etc...).

It may be used to normalize `NODE_ENV` values from given aliases as well as easily load all `.env` files using `dotenv-flow` and `dotenv-expand` behind the scenes.

A more complete documentation will be made available once the API has stabilized itself.

## Usage

```ts
import { AppEnvironment, EnvironmentProvider, getDefaultAppEnvironments, getCurrentAppEnvironment } from '@apoyo/config'
import { SSMProvider } from '@apoyo/config-ssm'

const supportedEnvs = getDefaultAppEnvironments()
const appEnv = getCurrentAppEnvironment(process.env.NODE_ENV, supportedEnvs)

const envProvider = new EnvironmentProvider({
  appEnv,
  path: process.cwd()
})

const envParams = await envProvider.load()

const ssmProvider = new SSMProvider({
  prefix: envParams['SSM_PREFIX'],
  key: envParams['AWS_ACCESS_KEY_ID'],
  secret: envParams['AWS_SECRET_ACCESS_KEY'],
  region: envParams['AWS_REGION'],
  mapper: (paramKey) => paramKey.toUpperCase()
})

const ssmParams = await ssmProvider.load()

// Merge parameters from env and ssm
const appParams = {
  ...envParams,
  ...ssmParams
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
