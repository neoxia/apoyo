import { Exception } from '@apoyo/std'

export class NotAuthenticatedException extends Exception {
  public readonly code = 'E_NOT_AUTHENTICATED'
  constructor() {
    super(`User is not authenticated`)
  }
}

export class NotAuthorizedException extends Exception {
  public readonly code = 'E_NOT_AUTHORIZED'
  constructor(public readonly action: string) {
    super(`User is not authorized to continue the action "${action}"`)
  }
}
