import { Exception } from '@apoyo/std'

export class JwtVerifyException extends Exception {
  public readonly code = 'E_JWT_VERIFY_FAILED'
  constructor(cause?: Error) {
    super('JWT verification failed', cause)
  }
}

export class JwtInvalidPayloadException extends Exception {
  public readonly code = 'E_JWT_INVALID_PAYLOAD'
  constructor(cause?: Error) {
    super('JWT contains an invalid payload', cause)
  }
}
