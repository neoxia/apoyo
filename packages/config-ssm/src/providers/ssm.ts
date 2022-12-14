import { AppParameters } from '@apoyo/config'
import { Parameter, SSM } from '@aws-sdk/client-ssm'
import { SSMProviderReadException } from '../exceptions'

export interface SSMProviderConfig {
  /**
   * When specified, only parameters prefixed by the given path will be returned.
   *
   * Note that the path prefix is removed from the parameter keys of the parameters read from SSM.
   */
  path?: string

  /**
   * AWS Access Key
   */
  key?: string

  /**
   * AWS Secret Key
   */
  secret?: string

  /**
   * AWS Region
   */
  region: string

  /**
   * Allows you to remap your SSM parameter names to a new parameter name.
   *
   * If no mapper is specified in the configuration object, the default mapper will try to constant-case the key to better match the name of existing environment variables.
   * This default mapper only handles basic use cases (param-case). For a more complete solution, we recommend using the `constant-case` package.
   */
  mapper?: SSMParameterKeyMapper
}

export type SSMParameterKeyMapper = (parameterKey: string) => string

/**
 * Get application parameters from AWS SSM
 */
export async function getParametersFromSSM(config: SSMProviderConfig) {
  const credentials =
    config.key && config.secret
      ? {
          accessKeyId: config.key,
          secretAccessKey: config.secret
        }
      : undefined

  const ssm = new SSM({
    region: config.region,
    credentials
  })

  const params = await getSSMParametersByPath(ssm, config.path)

  return ssmParametersToAppParameters(params, config)
}

async function getSSMParametersByPath(ssm: SSM, path?: string) {
  const params: Parameter[] = []
  let nextToken: string | undefined

  try {
    do {
      const result = await ssm.getParametersByPath({
        Path: path,
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
    throw new SSMProviderReadException(err)
  }

  return params
}

/**
 * Note: This function is not a proper constantCase and only handles basic use cases (param-case).
 * For a more complete and tested solution, we recommend using the `constant-case` package.
 */
function constantCase(key: string) {
  return key.split(/-/).filter(Boolean).join('_').toUpperCase()
}

function ssmParametersToAppParameters(
  ssmParameters: Parameter[],
  config: { path?: string; mapper?: SSMParameterKeyMapper }
): AppParameters {
  const keyMapper = config.mapper ?? constantCase
  const path = config.path ?? ''
  const map: AppParameters = {}

  for (const param of ssmParameters) {
    const key = param.Name
    if (!key) {
      continue
    }
    if (!key.startsWith(path)) {
      continue
    }
    const newKey = keyMapper(key.substring(path.length))

    map[newKey] = param.Value
  }

  return map
}
