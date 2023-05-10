import { LocalFileSystem } from './fs'
import { FileEventsLogger, FileEventsLoggerOptions } from './logger'
import { Scaffolder } from './scaffolder'
import { EjsTemplateEngine } from './template-engine'

export interface DefaultScaffolderOptions {
  templatesPath: string
  destinationPath: string
  parameters?: Record<string, unknown>
  logger?: FileEventsLoggerOptions
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
      parameters: options.parameters,
      listeners: [new FileEventsLogger(options.logger)]
    })
  }
}
