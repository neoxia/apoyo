import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export interface DeleteManyActionOptions {
  patterns: string[]
}

export class DeleteManyAction implements IScaffolderAction {
  constructor(private readonly options: DeleteManyActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {
    const files = await app.destination.list(this.options.patterns)

    for (const file of files) {
      await app.destination.delete(file)
    }
  }
}
