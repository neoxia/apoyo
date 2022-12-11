import { Exception } from '@apoyo/std'
import { ParametersProvider } from '@apoyo/config'
import { Parameter, SSM } from '@aws-sdk/client-ssm'

export class SSMFetchException extends Exception {
  public readonly code = 'E_SSM_FETCH'
  constructor(cause: Error) {
    super(`Could not fetch SSM parameters from AWS`, cause)
  }
}

export interface SSMProviderConfig {
  prefix?: string
  key?: string
  secret?: string
  region: string
  mapper?: SSMParameterKeyMapper
}

export type SSMParameterKeyMapper = (parameterKey: string) => string

export class SSMProvider implements ParametersProvider {
  private readonly _ssm: SSM
  private readonly _keyMapper: SSMParameterKeyMapper

  constructor(private readonly config: SSMProviderConfig) {
    const credentials =
      config.key && config.secret
        ? {
            accessKeyId: config.key,
            secretAccessKey: config.secret
          }
        : undefined

    this._ssm = new SSM({
      region: config.region,
      credentials
    })

    this._keyMapper = config.mapper ?? ((key) => key.toUpperCase())
  }

  /**
   * By default, the prefix is removed from the keys of the parameters fetched from SSM.
   * By default, if no "mapper" is specified in the configuration object, the key will be upper-cased to better match existing environment variables.
   */
  async load() {
    const prefix = this.config.prefix ?? ''
    const params = await this._getParametersByPrefix(prefix)

    const map: Record<string, string | undefined> = {}

    for (const param of params) {
      const key = param.Name
      if (!key) {
        continue
      }
      if (!key.startsWith(prefix)) {
        continue
      }
      const newKey = this._keyMapper(key.substring(prefix.length))

      map[newKey] = param.Value
    }

    return map
  }

  private async _getParametersByPrefix(prefix?: string) {
    const params: Parameter[] = []
    let nextToken: string | undefined

    try {
      do {
        const result = await this._ssm.getParametersByPath({
          Path: prefix,
          MaxResults: 100,
          Recursive: true,
          WithDecryption: true
        })

        nextToken = result.NextToken
        if (result.Parameters) {
          params.push(...result.Parameters)
        }
      } while (nextToken)
    } catch (err) {
      throw new SSMFetchException(err)
    }

    return params
  }
}
