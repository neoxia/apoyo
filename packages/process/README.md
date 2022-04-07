# Apoyo - Process

[![npm version](https://badgen.net/npm/v/@apoyo/process)](https://www.npmjs.com/package/@apoyo/process)

## Installation

Install peer dependencies:
`npm install @apoyo/std @apoyo/decoders @apoyo/scopes`

Install package:
`npm install @apoyo/process`

## Documentation

This package contains various utils and injectable focused on data from the current node process. This includes:

- Reading and validating NODE_ENV, with a preset of values ('development', 'staging', 'production' and 'testing').

- Reading, validating and parsing environment variables from `process.env` and .env files.

- Reading application information from the package.json.

- etc...

The full documentation will be made available soon.

## Example

Getting the node environment:

```ts
Process.$nodeEnv
```

Getting the environment variables:

```ts
/**
 * This injectable contains the environment variables of your application, no further parsing or loading is required.
 * 
 * The process.env variable is not overriden!
 */
Process.$env
```

Validating and parsing your environment variables:

```ts
/**
 * Create a new injectable that parses the env with the given schema.
 * This returns a fully typed object.
 * 
 * There is no need to manually load the environment, as this injectable depends on `Process.$env`, which will automatically load the .env files.
 */
const $dbEnv = Env.rules({
  DB_HOST: TextDecoder.string,
  DB_PORT: IntegerDecoder.int
})

const $dbConfig = Injectable.define($dbEnv, (env) => {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT
  }
})
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
