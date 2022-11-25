import { Exception } from '@apoyo/std'

export class AbstractProviderException extends Exception {
  public readonly code = 'E_PROVIDER_NOT_IMPLEMENTED'
  constructor(name: string) {
    super(`Abstract provider ${JSON.stringify(name)} has not been implemented`)
  }
}

export class ContainerClosedException extends Exception {
  public readonly code = 'E_CONTAINER_CLOSED'
  constructor() {
    super(`Container is closed and can not be used anymore. Re-create a new instance if required.`)
  }
}

export class ContainerAlreadyClosedException extends Exception {
  public readonly code = 'E_CONTAINER_ALREADY_CLOSED'
  constructor() {
    super(`Container is already closed.`)
  }
}
