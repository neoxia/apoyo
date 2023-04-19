import { Exception } from '@apoyo/std'

export class JwtException extends Exception {
  constructor(message: string, cause: Error | undefined, public readonly code: string) {
    super(message, cause)
  }
}

export class JwtVerifyException extends JwtException {
  constructor(cause?: Error) {
    super('JWT verification failed', cause, 'E_JWT_VERIFY_FAILED')
  }
}

export class JwtInvalidPayloadException extends JwtException {
  constructor(cause?: Error) {
    super('JWT contains an invalid payload', cause, 'E_JWT_INVALID_PAYLOAD')
  }
}
