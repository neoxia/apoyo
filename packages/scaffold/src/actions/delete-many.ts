import { Scaffolder } from '../scaffolder'
import { IScaffolderAction } from '../scaffolder-action'

export interface DeleteManyActionOptions {
  paths: string[]
}

export class DeleteManyAction implements IScaffolderAction {
  constructor(private readonly options: DeleteManyActionOptions) {}

  public async execute(app: Scaffolder): Promise<void> {
    const fs = app.getFileSystem()

    const files = await fs.list(this.options.paths)

    for (const file of files) {
      await fs.delete(file)
    }
  }
}
