import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export interface AppendActionOptions {
  from: string
  to: string
  after: string | RegExp
}

export class AppendAction implements IScaffolderAction {
  constructor(private readonly options: AppendActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {

    const exists = await app.destination.exists(this.options.to)
    if (exists) {
      // TODO: create custom exception
      throw new Error('could not append: destination file does not exist')
    }

    const template = await app.templates.get(this.options.from)
    const rendered = await app.render(template)

    const source = await app.destination.get(this.options.to)
    const lines = source.split(/(\n|\r\n)/)

    const idx = lines.findIndex(line => line.match(this.options.after))
    if (idx !== -1) {
      lines.splice(idx + 1, 0, rendered)
    }

    await app.destination.write(this.options.to, lines.join('\n'))
  }
}
