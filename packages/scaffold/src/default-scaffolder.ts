import { LocalFileSystem } from './fs'
import { Scaffolder } from './scaffolder'
import { EjsTemplateEngine } from './template-engine'

export interface DefaultScaffolderOptions {
  templatesPath: string
  destinationPath: string
  parameters?: Record<string, unknown>
}

export class DefaultScaffolder extends Scaffolder {
  constructor(options: DefaultScaffolderOptions) {
    super({
      renderer: new EjsTemplateEngine(),
      destination: new LocalFileSystem({
        rootDir: options.destinationPath
      }),
      templates: new LocalFileSystem({
        rootDir: options.templatesPath
      }),
      parameters: options.parameters
    })
  }
}
