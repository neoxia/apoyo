# Apoyo - Process

[![npm version](https://badgen.net/npm/v/@apoyo/process)](https://www.npmjs.com/package/@apoyo/process)

## Installation

Install peer dependencies:
`npm install @apoyo/std @apoyo/decoders @apoyo/scopes`

Install package:
`npm install @apoyo/process`

## Documentation

This package contains various utils and injectable focused on data from the current node process. This includes:

- Reading and validating NODE_ENV, with a preset of supported values ('development', 'staging', 'production' and 'test').

- Reading, validating and parsing environment variables from `process.env` and .env files.

- Reading application information from the package.json.

- etc...

The full documentation will be made available soon.

## Example

### Getting the current application environment

```ts
Process.$appEnv
```

**Note**: If no NODE_ENV is specified, the environment will be set to `production`.

### Getting and/or mocking the environment variables

```ts
Process.$env
```

**Note**: This injectable will automatically load and include variables from matching .env files. See `dotenv-flow` for more information.

**Note**: The process.env variable is not overriden!

### Validating and parsing your environment variables

`Env.define` creates a new injectable that parses the env with the given schema. This returns a fully typed object.

```ts
const $dbEnv = Env.define({
  DB_HOST: TextDecoder.string,
  DB_PORT: IntegerDecoder.int
})

const $dbConfig = Injectable.define([$dbEnv], (env) => {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT
  }
})
```

**Note**: There is no need to manually load the environment, as this injectable depends on `Process.$env`, which will automatically load the .env files.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
