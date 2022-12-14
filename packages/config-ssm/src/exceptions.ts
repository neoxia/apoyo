import { ParameterProviderException } from '@apoyo/config'

export class SSMProviderException extends ParameterProviderException {}

/**
 * Exception thrown when the SSM parameters could not be read from AWS.
 */
export class SSMProviderReadException extends SSMProviderException {
  constructor(cause: Error) {
    super(`Could not read SSM parameters from AWS`, cause, 'E_SSM_PROVIDER_READ')
  }
}
