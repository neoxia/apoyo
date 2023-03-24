import { IFileSystem } from './fs'
import { IScaffolderAction } from './scaffolder-action'
import { ITemplateEngine } from './template-engine'

import * as changeCase from 'change-case'
import * as inflection from 'inflection'

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

  public getHelpers() {
    return {
      changeCase,
      inflection
    }
  }

  public getParameters() {
    return this.options.parameters ?? {}
  }

  public getDist() {
    return this.options.dist
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

  public async render(content: string): Promise<string> {
    return this.getRenderer().render(content, {
      h: this.getHelpers(),
      ...this.getParameters()
    })
  }
}
