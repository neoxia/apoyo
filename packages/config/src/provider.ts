import { AppParameters } from './app-parameters'

export interface ParametersProvider {
  load(): Promise<AppParameters>
}
