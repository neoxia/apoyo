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
    const after = new RegExp(Str.regexpEscape(await app.render(this.options.after, this.options.parameters)))
    const skipIf = this.options.skipIf
      ? new RegExp(Str.regexpEscape(await app.render(this.options.skipIf, this.options.parameters)))
      : null

    const exists = await app.destination.exists(to)
    if (!exists) {
      throw new AppendFileNotFoundException(to)
    }

    const template = await app.templates.get(from)
    const rendered = await app.render(template)

    const source = await app.destination.get(to)
    const lines = source.split('\n')

    const idx = lines.findIndex((line) => after.test(line))
    const skip = skipIf ? skipIf.test(source) : false

    if (skip) {
      // eslint-disable-next-line no-console
      console.log(`skip append ${to}`)
    }

    if (idx !== -1 && skip === false) {
      lines.splice(idx + 1, 0, rendered)
    }

    await app.destination.write(to, lines.join('\n'))
  }
}
