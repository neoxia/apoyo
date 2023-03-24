import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export interface CopyFilesActionOptions {
  patterns: string[]
  from: string
  to?: string
}

export class CopyFilesAction implements IScaffolderAction {
  constructor(private readonly options: CopyFilesActionOptions) {}

  public async execute(parent: Scaffolder): Promise<void> {
    const app = parent.child({
      templates: parent.templates.cd(this.options.from),
      destination: this.options.to ? parent.destination.cd(this.options.to) : undefined
    })

    const files = await app.templates.list(this.options.patterns)

    for (const file of files) {
      await app.destination.write(file, await app.templates.get(file))
    }
  }
}
