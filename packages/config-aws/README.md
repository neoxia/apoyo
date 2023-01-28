# Apoyo - Config SSM

[![npm version](https://badgen.net/npm/v/@apoyo/config-aws)](https://www.npmjs.com/package/@apoyo/config-aws)

**Warning**: This package is still unstable! The API may still change!

## Installation

Install peer dependencies:
`npm install @apoyo/std @apoyo/config`

Install package:
`npm install @apoyo/config-aws`

## Documentation

Get app parameters from SSM using the following exported function:

```ts
import { Parameters } from '@apoyo/config'
import { getParametersFromSSM } from '@apoyo/config-aws'

const ssmParams: Parameters = await getParametersFromSSM({
  path: '/projects/my-app/',
  key: 'access key',
  secret: 'secret key'
})
```

A more complete documentation will be made available once the API has stabilized itself.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
