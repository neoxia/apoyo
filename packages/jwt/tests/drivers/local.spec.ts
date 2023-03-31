import { decode, sign } from 'jsonwebtoken'
import { LocalJwtManager, ILocalJwtStrategy, ILocalJwtConfig, JwtInvalidPayloadException } from '../../src'

interface User {
  id: string
  email: string
}

describe('LocalJwtManager', () => {
  let manager: LocalJwtManager<User, User>

  const user: User = {
    id: '1',
    email: 'test@example.com'
  }

  const options: ILocalJwtConfig = {
    algorithm: 'HS256',
    issuer: 'my-app',
    audience: 'my-app',
    secretOrPrivateKey: 'my-secret',
    secretOrPublicKey: 'my-secret',
    expiresIn: '1h'
  }

  beforeEach(async () => {
    const userRepository = {
      async findById(_id: string) {
        return user
      }
    }

    const strategy: ILocalJwtStrategy<User, User> = {
      async build(input) {
        return {
          sub: input.id,
          email: input.email
        }
      },
      async authenticate(payload) {
        const userId = payload.sub
        if (!userId) {
          throw new JwtInvalidPayloadException()
        }
        return userRepository.findById(userId)
      }
    }

    manager = new LocalJwtManager(options, strategy)
  })

  describe('sign', () => {
    it('should sign jwt correctly', async () => {
      const token = await manager.sign(user)

      const payload = decode(token, {
        complete: false
      })

      expect(payload).toEqual({
        sub: user.id,
        email: user.email,
        aud: options.audience,
        iss: options.issuer,
        exp: expect.any(Number),
        iat: expect.any(Number)
      })
    })
  })

  describe('authenticate', () => {
    it('should return authenticated user correctly', async () => {
      const token = sign(
        {
          sub: user.id,
          email: user.email
        },
        options.secretOrPrivateKey,
        {
          algorithm: options.algorithm,
          issuer: options.issuer,
          audience: options.audience,
          expiresIn: options.expiresIn
        }
      )

      const authenticated = await manager.authenticate(token)

      expect(authenticated).toEqual(user)
    })
  })
})
