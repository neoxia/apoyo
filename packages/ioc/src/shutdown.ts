import { Arr, Ord, pipe } from '@apoyo/std'

export enum ShutdownPriority {
  LOW = 10,
  MEDIUM = 50,
  HIGH = 100
}

export interface ShutdownHook {
  close(): Promise<void>
  priority: number
}

const ordByPriority = pipe(
  Ord.number,
  Ord.contramap((hook: ShutdownHook) => hook.priority)
)

export class ShutdownHooks {
  private _hooks: ShutdownHook[] = []

  public register(close: () => Promise<void>, priority: number) {
    this._hooks.push({
      close,
      priority
    })
  }

  public async execute() {
    const sortedHooks = pipe(this._hooks, Arr.sort(ordByPriority), Arr.reverse)
    for (const hook of sortedHooks) {
      await hook.close()
    }
  }
}
