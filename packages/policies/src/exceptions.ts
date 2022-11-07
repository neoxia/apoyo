import { Exception } from '@apoyo/std'

export class NoUserContextException extends Exception {
  public readonly code = 'E_NO_USER_CONTEXT'
  constructor() {
    super(`No user context found. Are you sure you initialized the user context correctly?`)
  }
}

export class NotAuthenticatedException extends Exception {
  public readonly code = 'E_NOT_AUTHENTICATED'
  constructor() {
    super(`User is not authenticated`)
  }
}

export class NotAuthorizedException extends Exception {
  public readonly code = 'E_NOT_AUTHORIZED'
  constructor(message?: string) {
    super(message ?? `User is not authorized to continue the given action`)
  }
}
