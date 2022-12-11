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

However, very few DI solutions exist that are fully type-safe and easy to use. This solution also completely forgoes decorators to achieve higher type-safeness and better decoupling by encouraging the use of abstractions.

<!-- ### Vocabulary

**Provider**: A provider is an object that tells us **how** to create a given class instance, value, interface or type and **how** to store / retrieve this value in our container (by using an **unique key**).

**Container**: A container is an object that allows us to **retrieve** the value associated to a `Provider`.
The container will initialize this `Provider` and load all its dependencies if the provider has not been loaded yet.

The container also keeps a record of all providers that have already been been loaded, to avoid re-loading the same `Provider` twice. -->

## Features

### Ease of use

This library is very easy to use while still being fully typed.

In the example below, we organize our providers in "modules" / "namespaces":

```ts
import { Provider } from '@apoyo/ioc'

export class ConfigurationModule {
  private static ENV = Provider.fromFactory(loadEnvironment, [])
  
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

### Integrations

This library is very easy to use with existing third-party libraries:

```ts
export class MailerModule {
  static MAILER = Provider.fromFactory(createNodemailer, [ConfigurationModule.MAILER])
}
```

### Composition

This library **encourages composition**: As a provider is a simple variable,  we can also pass them as parameters to functions and dynamically create new ones:

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
  private static LOGGER = LoggerModule.child('Mailer')

  static MAILER = Provider.fromFactory(createNodemailer, [
    ConfigurationModule.MAILER, 
    MailerModule.LOGGER
  ])
}
```

### Resource management

This library has inbuild resource management, to automatically cleaned up **disposable resources** when the container is closed:

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

You may also specify a shutdown priority to control the order in which your resources are cleaned up, from the highest priority first to the lowest priority at last.

### No decorators

This library does not offer **decorators support**: while this is opiniated, there are not supported for multiple reasons:

- Your implementations **should not be aware** of the framework / IoC container system you use. Decorators go against this practice, as they need to be applied on your implementations directly.

- Decorators encourage **higher coupling**, by making it harder to depend on an abstraction, instead of an implementation: In fact, most of the time, when using decorators, you inject **classes** and not **interfaces**.

- It is easy to introduce run-time errors with decorators:

```ts
@Injectable()
class MyService {
  // We forgot to tell our IoC how to provide / create a Mailer instance.
  // Typescript does not complain, however you WILL receive a run-time error.
  constructor(private readonly mailer: Mailer) {}
}
```

- Decorators can not verify that the token you inject correspond to the given type:

```ts
@Injectable()
class MyService {
  // How should we know if MY_TOKEN is a "string"? It may as well be a "number". 
  // Typescript cannot statically ensure that we used the correct type here.
  // It also makes injecting non-class variables less intuitif, because you need to know which token is associated to which value.
  constructor(@Inject(MY_TOKEN) private readonly myToken: string) {}
}
```

- Decorators can only be applied to **your** classes. They won't work for primitives or factories or classes from third-party libraries. As such, if you want to create providers for third-party libraries (for example), you will need to use a different API, which means you sometimes use decorators and sometimes a different API. This makes your code less consistent.

This library makes this choice very simple: There is only one way to create providers.

### Circular dependencies

This library does not support **circular dependencies**. As such, the following is impossible:

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

Circular dependencies will **not be supported** in the future either! Most of the time, circular dependencies can easily be avoided by splitting up your code correctly.
