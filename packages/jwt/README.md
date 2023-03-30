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

```ts
import { 
  IJwtVerifier, 
  JwtInvalidPayloadException, 
  LocalJwtManager, 
  CognitoJwtManager
} from '@apoyo/jwt'

const localDriver = new LocalJwtManager({
  secretOrPublicKey: 'mysecret',
  secretOrPrivateKey: 'mysecret',
  issuer: 'Me',
  expiresIn: '1h',
  async encode(user: User): Promise<unknown> {
    return {
      sub: user.id,
      email: user.email
    }
  }
  async decode({ header, payload, jwk }): Promise<User> {
    if (typeof payload !== 'object' || payload === null) {
      throw new JwtInvalidPayloadException()
    }

    const userId = payload?.sub ?? null
    const user = await userRepository.findById(userId)

    if (user === null) {
      throw new JwtInvalidPayloadException()
    }

    return user
  }
})

const cognitoDriver = new CognitoJwtManager({
  cognitoPoolId: 'string',
  async decode ({ header, payload, jwk }): Promise<User> {
    // ...
  }
})

// Somewhere else

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
