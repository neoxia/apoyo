import { Exception } from '@apoyo/std'

export class ParameterProviderException extends Exception {
  constructor(message: string, cause: Error | undefined, public readonly code: string) {
    super(message, cause)
  }
}
