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
}

export type SSMParameterKeyMapper = (parameterKey: string) => string

export class SSMProvider implements ParametersProvider {
  private ssm: SSM

  constructor(
    private readonly config: SSMProviderConfig,
    private readonly mapper: SSMParameterKeyMapper = (key) => key.toUpperCase()
  ) {
    const credentials =
      config.key && config.secret
        ? {
            accessKeyId: config.key,
            secretAccessKey: config.secret
          }
        : undefined

    this.ssm = new SSM({
      region: config.region,
      credentials
    })
  }

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
      const newKey = this.mapper(key.substring(prefix.length))

      map[newKey] = param.Value
    }

    return map
  }

  private async _getParametersByPrefix(prefix?: string) {
    const params: Parameter[] = []
    let nextToken: string | undefined

    try {
      do {
        const result = await this.ssm.getParametersByPath({
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
