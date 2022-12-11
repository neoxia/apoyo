# Providers

## Create an provider

There are multiple ways to create an provider.

1. From a constant:

```ts
export class ConfigurationModule {
  static HTTP = Provider.fromConst<HttpConfig>({
    port: 3000
  })
}
```

2. From a factory function:

```ts
// config/http.ts
export function configureHttp() {
  return {
    port: 3000
  }
}

// providers/config.ts
export class ConfigurationModule {
  static HTTP = Provider.fromFactory(configureHttp, [])
}
```

3. From a class:

```ts
// infra/jwt/local.ts
export class LocalJwtVerifier implements JwtVerifier {
  constructor(options: LocalJwtVerifierOptions) {}

  async verify(token: string) {
    // ...
    return {
      sub: 'user_id'
    }
  }
}

// providers/config.ts
export class JwtModule {
  static JWT_VERIFIER = pipe(
    Provider.fromClass(LocalJwtVerifier, [ConfigurationModule.JWT_VERIFIER_LOCAL]),
    Provider.asType<JwtVerifier>()
  )
}
```

In the example above, we also down-casted our type and verified that `LocalJwtVerifier` implements correctly the `JwtVerifier` interface.

## Dependencies

Most of the time, your implementations / factories also have their own dependencies. You will need to specify correctly typed `Provider`s when creating the provider for these implementations:

```ts
// config/http.ts

// This function does not need to know where the env comes from or how it is computed
function configureHttp(env: Record<string, string | undefined>) {
  assert(env.PORT, 'env.PORT is not defined.')

  const port = parseInt(env.PORT)

  assert(!Number.isNaN(port), 'env.PORT is not an integer.')

  return {
    port
  }
}

// providers/config.ts
export class ConfigurationModule {
  private static ENV = Provider.fromFactory(loadEnvironment, [])
  
  // We specify the dependencies in the correct order.
  // These dependencies need to match the types of the parameters of the factory.
  static HTTP = Provider.fromFactory(configureHttp, [ConfigurationModule.ENV])
}
```
