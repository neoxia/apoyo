import { Str } from '@apoyo/std'
import { FileModifiedEvent, FileSkippedEvent } from '../events'
import { FileNotFoundException } from '../exceptions'

import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export class ReplaceFileNotFoundException extends FileNotFoundException {
  constructor(public readonly filename: string) {
    super(`could not replace: destination file does not exist`)
  }
}

export interface ReplaceActionOptions {
  /**
   * Path to the template file or text content of the template
   */
  from: string | { content: string }
  to: string
  replace: string
  global?: boolean
  skipIf?: string

  /**
   * Additional parameters
   */
  parameters?: Record<string, unknown>
}

export class ReplaceAction implements IScaffolderAction {
  constructor(private readonly options: ReplaceActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {
    const from = this.options.from
    const to = await app.render(this.options.to, this.options.parameters)
    const global = this.options.global ?? false
    const flags = global ? 'g' : ''
    const replace = new RegExp(Str.regexpEscape(await app.render(this.options.replace, this.options.parameters)), flags)
    const skipIf = this.options.skipIf
      ? new RegExp(Str.regexpEscape(await app.render(this.options.skipIf, this.options.parameters)))
      : null

    const exists = await app.destination.exists(to)
    if (!exists) {
      throw new ReplaceFileNotFoundException(to)
    }

    const template = typeof from === 'string' ? await app.templates.get(from) : from.content
    const rendered = await app.render(template, this.options.parameters)

    const source = await app.destination.get(to)

    const found = replace.test(source)
    const skip = skipIf ? skipIf.test(source) : false

    if (skip === true || found === false) {
      app.dispatch(new FileSkippedEvent(app.destination.resolve(to)))
      return
    }

    const transformed = source.replace(replace, rendered)

    await app.destination.write(to, transformed)

    app.dispatch(new FileModifiedEvent(app.destination.resolve(to)))
  }
}
