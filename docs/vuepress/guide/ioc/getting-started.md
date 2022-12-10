# Getting started

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/ioc`

## Motivation

Today, a lot of solutions exists for dependency injection in JS/TS, the most popular solutions being:

- Nestjs
- Inversify
- Typedi
- etc...

However, very few DI solutions exist that are fully type-safe and are easy to use.

<!-- ### Vocabulary

**Provider**: A provider is an object that tells us **how** to create a given class instance, value, interface or type and **how** to store / retrieve this value in our container (by using an **unique key**).

**Container**: A container is an object that allows us to **retrieve** the value associated to a `Provider`.
The container will initialize this `Provider` and load all its dependencies if the provider has not been loaded yet.

The container also keeps a record of all providers that have already been been loaded, to avoid re-loading the same `Provider` twice. -->

### Unique features

Here a few unique features of this library:

1/ Easily create fully typed providers:

```ts
import { Provider } from '@apoyo/ioc'

export class ConfigurationModule {
  static ENV = Provider.fromFactory(loadEnvironment, [])
  
  static HTTP = Provider.fromFactory(configureHttp, [ConfigurationModule.ENV])
  static LOGGER = Provider.fromFactory(configureLogger, [ConfigurationModule.LOGGER])
}
```

You can then resolve these `Provider`s through a `Container`:

```ts
const container = new Container()

// Only now do we instantiate `ConfigurationModule.HTTP` (and its dependencies)
const httpConfig = await container.get(ConfigurationModule.HTTP)
```

**Note**: Keep in mind that providers are simply "factories". They don't execute anything by themselves, nor should they: they only "wire" up our dependencies / tell our program how to instantiate everything.

<br/>

2/ Very easy to integrate with existing third-party libraries:

```ts
export class MailerModule {
  static MAILER = Provider.fromFactory(createNodemailer, [ConfigurationModule.MAILER])
}
```

<br/>

3/ **Encourages composition**: A provider is a simple variable. This means we can also pass them as parameters to functions and dynamically create new ones:

*Example*:

```ts
export class LoggerModule {
  static LOGGER = Provider.fromFactory(createPinoLogger, [ConfigurationModule.LOGGER])

  static child(contextName: string): Provider<Logger> {
    return Provider.from(async (container): Logger => {
      const logger = await container.get(LoggerModule.LOGGER)
      return logger.child({
        name: contextName
      })
    })
  }
}

export class MailerModule {
  private static MAILER_LOGGER = LoggerModule.child('Mailer')

  static MAILER = Provider.fromFactory(createNodemailer, [
    ConfigurationModule.MAILER, 
    MailerModule.MAILER_LOGGER
  ])
}
```

<br/>

4/ **Disposable resources** that can be cleaned up when the container is closed:

```ts
export class HttpModule {
  static APP = Provider.fromFactory(createApp, [LoggerModule.LOGGER])

  static SERVER = pipe(
    Provider.fromFactory(createServer, [HttpModule.APP, ConfigurationModule.HTTP]),
    Provider.asResource({
      priority: ShutdownPriority.HIGH,
      close: (server) => server.close()
    })
  )
}
```

<br/>

5/ **No native support decorators**: while this is opiniated, there are not supported for multiple reasons:

- Your implementations **should not be aware** of the framework / IoC container system you use. Decorators go against this practice, as they need to be applied on your implementations.

- It is easy to produce run-time errors with decorators:

```ts
@Injectable()
class MyService {
  // We forgot to tell our IoC how to provide / create a Mailer instance.
  // Typescript does not complain, however you WILL receive a run-time error.
  constructor(private readonly mailer: Mailer) {}
}
```

- Decorators have the issue of not always being type-safe, especially:

```ts
@Injectable()
class MyService {
  // How should we know if MY_TOKEN is a "string"? It may as well be a "number". 
  // Typescript cannot statically ensure that we used the correct type here.
  // It also makes injecting non-class variables less intuitif, because you need to know which token is associated to which value.
  constructor(@Inject(MY_TOKEN) private readonly myToken: string) {}
}
```

- Decorators can also only be applied to classes. They won't work for primitives or factories.

<br/>

6/ **No circular dependencies are supported**. As such, the following is impossible:

```ts
// This does not work
export class MyModule {
  static A = Provider.fromFactory((b) => b, [MyModule.B])
  static B = Provider.fromFactory((a) => a, [MyModule.A])
}

// This does not work either
const a = b
const b = a
```

Circular dependencies will **not be supported** in the future either! Most of the time, circular dependencies can be avoided by splitting up your code correctly.
