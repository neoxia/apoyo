import { Str } from '@apoyo/std'
import { FileModifiedEvent, FileSkippedEvent } from '../events'
import { FileNotFoundException } from '../exceptions'

import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export class AppendFileNotFoundException extends FileNotFoundException {
  constructor(public readonly filename: string) {
    super(`could not append: destination file does not exist`)
  }
}

export interface AppendActionOptions {
  /**
   * Path to the template file or text content of the template
   */
  from: string | { content: string }
  to: string
  after?: string
  skipIf?: string

  /**
   * Additional parameters
   */
  parameters?: Record<string, unknown>
}

export class AppendAction implements IScaffolderAction {
  constructor(private readonly options: AppendActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {
    const from = this.options.from
    const to = await app.render(this.options.to, this.options.parameters)
    const after = this.options.after
      ? new RegExp(Str.regexpEscape(await app.render(this.options.after, this.options.parameters)))
      : null
    const skipIf = this.options.skipIf
      ? new RegExp(Str.regexpEscape(await app.render(this.options.skipIf, this.options.parameters)))
      : null

    const exists = await app.destination.exists(to)
    if (!exists) {
      throw new AppendFileNotFoundException(to)
    }

    const template = typeof from === 'string' ? await app.templates.get(from) : from.content
    const rendered = await app.render(template, this.options.parameters)

    const source = await app.destination.get(to)
    const lines = source.split('\n')

    const idx = after ? lines.findIndex((line) => after.test(line)) : lines.length - 1
    const skip = skipIf ? skipIf.test(source) : false

    if (skip === true || idx === -1) {
      app.dispatch(new FileSkippedEvent(app.destination.resolve(to)))
      return
    }

    lines.splice(idx + 1, 0, rendered)

    await app.destination.write(to, lines.join('\n'))

    app.dispatch(new FileModifiedEvent(app.destination.resolve(to)))
  }
}
