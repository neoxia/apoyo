# Apoyo - Logger

[![npm version](https://badgen.net/npm/v/@apoyo/logger)](https://www.npmjs.com/package/@apoyo/logger)

**Warning**: This package is still in development and is not recommended to use in production yet.

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/logger`

## Documentation

This package contains utils around Pino loggers.

It adds once again the `prettyPrint` option to more easily enable pretty printing in development, with sensible defaults.

It also contains a `LoggerContext` that, using `AsyncLocalStorage`, allows us to add additional bindings to each logger in a same asynchronous scope easily.

```ts
import { createLogger, LogLevel, LoggerContext } from '@apoyo/logger'

const loggerContext = new LoggerContext()
const logger = createLogger(
  {
    level: LogLevel.INFO,
    prettyPrint: true
  }, 
  loggerContext // This parameter is optional
)

const featureLogger = logger.child({
  name: 'MyFeature',
  foo: 'bar' 
})

const reqLogger = logger.child({
  name: 'Http',
  foo: 'foo',
  req: {
    id: 'xxx-xxx-xxx'
  }
})

loggerContext.attachBindings(reqLogger.bindings(), async () => {
  /*
   * Logs the following custom properties (not including the message, level and other default pino properties):
   * ```
   * {
   *   name: 'MyFeature', 
   *   foo: 'bar', 
   *   req: { 
   *     id: 'xxx-xxx-xxx' 
   *   }
   * }
   * ```
   */
  featureLogger.info('hello world')
})
```

A more complete documentation will be written when the package becomes stable.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
