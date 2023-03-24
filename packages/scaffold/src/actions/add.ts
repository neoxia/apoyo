import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export interface AddActionOptions {
  from: string
  to: string

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

export class AddAction implements IScaffolderAction {
  constructor(private readonly options: AddActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {
    const skipIfExists = this.options.skipIfExists ?? false

    const from = this.options.from
    const to = await app.render(this.options.to, this.options.parameters)

    if (skipIfExists) {
      const exists = await app.destination.exists(to)
      if (exists) {
        return
      }
    }

    const template = await app.templates.get(from)
    const rendered = await app.render(template, this.options.parameters)

    await app.destination.write(to, rendered)
  }
}
