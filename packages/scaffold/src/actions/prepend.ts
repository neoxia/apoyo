import { Str } from '@apoyo/std'
import { FileNotFoundException } from '../exceptions'
import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export class PrependFileNotFoundException extends FileNotFoundException {
  constructor(public readonly filename: string) {
    super(`could not prepend: destination file does not exist`)
  }
}

export interface PrependActionOptions {
  from: string
  to: string
  before: string

  /**
   * Additional parameters
   */
  parameters?: Record<string, unknown>
}

export class PrependAction implements IScaffolderAction {
  constructor(private readonly options: PrependActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {
    const from = this.options.from
    const to = await app.render(this.options.to, this.options.parameters)
    const before = new RegExp(Str.regexpEscape(await app.render(this.options.before, this.options.parameters)))

    const exists = await app.destination.exists(to)
    if (!exists) {
      throw new PrependFileNotFoundException(to)
    }

    const template = await app.templates.get(from)
    const rendered = await app.render(template)

    const source = await app.destination.get(to)
    const lines = source.split(/(\n|\r\n)/)

    const idx = lines.findIndex((line) => line.match(before))
    if (idx !== -1) {
      lines.splice(idx, 0, rendered)
    }

    await app.destination.write(to, lines.join('\n'))
  }
}
