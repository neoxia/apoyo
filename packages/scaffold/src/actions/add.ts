import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export interface AddActionOptions {
  from: string
  to: string

  /**
   * @default false
   */
  skipIfExists?: boolean
}

export class AddAction implements IScaffolderAction {
  constructor(private readonly options: AddActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {

    const skipIfExists = this.options.skipIfExists ?? false

    if (skipIfExists) {
      const exists = await app.destination.exists(this.options.to)
      if (exists) {
        return
      }
    }

    const template = await app.templates.get(this.options.from)
    const rendered = await app.render(template)

    await app.destination.write(this.options.to, rendered)
  }
}
