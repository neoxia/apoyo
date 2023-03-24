import { Str } from '@apoyo/std'
import { FileNotFoundException } from '../exceptions'

import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export class AppendFileNotFoundException extends FileNotFoundException {
  constructor(public readonly filename: string) {
    super(`could not append: destination file does not exist`)
  }
}

export interface AppendActionOptions {
  from: string
  to: string
  after: string

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
    const after = new RegExp(Str.regexpEscape(await app.render(this.options.after, this.options.parameters)))

    const exists = await app.destination.exists(to)
    if (!exists) {
      throw new AppendFileNotFoundException(to)
    }

    const template = await app.templates.get(from)
    const rendered = await app.render(template)

    const source = await app.destination.get(to)
    const lines = source.split(/(\n|\r\n)/)

    const idx = lines.findIndex((line) => after.test(line))
    if (idx !== -1) {
      lines.splice(idx + 1, 0, rendered)
    }

    await app.destination.write(to, lines.join('\n'))
  }
}
