import { Exception } from '@apoyo/std'

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

export class ContainerUnsupportedEventException extends Exception {
  public readonly code = 'E_CONTAINER_UNSUPPORTED_EVENT'
  constructor(public readonly event: string) {
    super(`Container event "${event}" is not supported.`)
  }
}
