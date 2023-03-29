import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'
import { AddAction } from './add'

export interface AddManyActionOptions {
  from: string
  to?: string
  patterns: string[]

  /**
   * Skip file if it already exists
   * @default false
   */
  skipIfExists?: boolean

  /**
   * Additional parameters
   */
  parameters?: Record<string, unknown>
}

export class AddManyAction implements IScaffolderAction {
  constructor(private readonly options: AddManyActionOptions) {}

  public async execute(parent: Scaffolder): Promise<void> {
    const app = parent.child({
      templates: parent.templates.cd(this.options.from),
      destination: this.options.to ? parent.destination.cd(this.options.to) : undefined
    })

    const files = await app.templates.list(this.options.patterns)
    const extension = app.renderer.extension

    const actions = files.map((file) => {
      const dest = file.endsWith(extension) ? file.slice(0, file.length - extension.length) : file

      return new AddAction({
        from: file,
        to: dest,
        skipIfExists: this.options.skipIfExists,
        parameters: this.options.parameters
      })
    })

    await app.execute(actions)
  }
}
