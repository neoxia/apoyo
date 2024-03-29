import { FileCreatedEvent, FileModifiedEvent, FileSkippedEvent } from '../events'
import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export interface AddActionOptions {
  /**
   * Path to the template file or text content of the template
   */
  from: string | { content: string }
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

    const exists = await app.destination.exists(to)

    if (skipIfExists && exists) {
      app.dispatch(new FileSkippedEvent(app.destination.resolve(to)))
      return
    }

    const template = typeof from === 'string' ? await app.templates.get(from) : from.content
    const rendered = await app.render(template, this.options.parameters)

    await app.destination.write(to, rendered)

    if (exists) {
      app.dispatch(new FileModifiedEvent(app.destination.resolve(to)))
    } else {
      app.dispatch(new FileCreatedEvent(app.destination.resolve(to)))
    }
  }
}
