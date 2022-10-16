import { PolicyContext } from './policy-context'

export interface Policy<ContextType extends PolicyContext<any>, Args extends any[]> {
  name: string
  execute: (ctx: ContextType, ...args: Args) => Promise<void>
}
