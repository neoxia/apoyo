import { IFileSystem } from './fs'
import { IScaffolderAction } from './scaffolder-action'
import { ITemplateEngine } from './template-engine'

export interface ScaffolderOptions {
  fs: IFileSystem
  renderer: ITemplateEngine
  dist: string
  parameters?: Record<string, unknown>
}

export class Scaffolder {
  constructor(private readonly options: ScaffolderOptions) {}

  public getFileSystem() {
    return this.options.fs
  }

  public getRenderer() {
    return this.options.renderer
  }

  public getParameters() {
    return this.options.parameters ?? {}
  }

  public child(options: Partial<ScaffolderOptions>) {
    return new Scaffolder({
      ...this.options,
      ...options,
      parameters: {
        ...this.options.parameters,
        ...options?.parameters
      }
    })
  }

  public async execute(actions: IScaffolderAction[]): Promise<void> {
    for (const action of actions) {
      await action.execute(this)
    }
  }
}
