# Apoyo - Jwt

[![npm version](https://badgen.net/npm/v/@apoyo/jwt)](https://www.npmjs.com/package/@apoyo/jwt)

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/jwt`

## Documentation

The `jwt` package series contains different drivers and abstractions for JWT signing and validation.

A more complete documentation will be made available once the API has stabilized itself.

## Usage

### Local JWT

1. Define your strategy:

```ts
export class LocalJwtStrategy implements ILocalJwtStrategy<User, User> {
  constructor(private readonly userRepository: UserRepository) {}

  public async build(user): Promise<unknown> {
    return {
      sub: user.id,
      email: user.email
    }
  }

  public async authenticate(payload): Promise<User> {
    if (typeof payload !== 'object' || payload === null) {
      throw new JwtInvalidPayloadException()
    }

    const userId = payload?.sub ?? null
    const user = await this.userRepository.findById(userId)

    if (user === null) {
      throw new JwtInvalidPayloadException()
    }

    return user
  }
}
```

2. Create your JWT Manager:

```ts
const localConfig: ILocalJwtConfig = {
  secretOrPublicKey: 'mysecret',
  secretOrPrivateKey: 'mysecret',
  issuer: 'Me',
  expiresIn: '1h',
}
const localStrategy = new LocalJwtStrategy(...)
const localJwt = new LocalJwtManager(localConfig, localStrategy)
```

### Cognito

1. Define your strategy:

```ts
export class CognitoJwtStrategy implements ICognitoJwtStrategy<User, User> {
  constructor(private readonly userRepository: UserRepository) {}

  public async authenticate(payload): Promise<User> {
    const userId = payload?.sub ?? null
    const user = await this.userRepository.findById(userId)

    if (user === null) {
      throw new JwtInvalidPayloadException()
    }

    return user
  }
}
```

2. Create your JWT Manager:

```ts
const cognitoConfig: ICognitoJwtConfig = {
  userPoolId: 'my-user-pool',
  clientId: 'my-client-id'
}
const cognitoStrategy = new CognitoJwtStrategy(...)
const cognitoJwt = new CognitoJwtManager(cognitoConfig, cognitoStrategy)
```

### Authentication

```ts
export class AuthContext {
  private readonly context = new AsyncLocalStorage<User>()

  constructor(
    private readonly jwt: IJwtVerifier<User>
  ) {}

  public async authenticateByJwt(token: string) {
    const user = await this.jwt.authenticate(token)

    this.context.enterWith(user)

    return user
  }

  public getUser() {
    return this.context.getStore() ?? null
  }
}
```

**Note**: This code is exactly the same as for the local JWT manager.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
