import { Scaffolder } from './scaffolder'

export interface IScaffolderAction {
  execute(app: Scaffolder): Promise<void>
}
