import { PolicyContext } from './policy-context'

export type PolicyFn<ContextType extends PolicyContext<unknown>, Args extends any[]> = (
  ctx: ContextType,
  ...args: Args
) => boolean | Promise<boolean> | void | Promise<void>

export interface Policy<ContextType extends PolicyContext<unknown>, Args extends any[]> {
  execute: PolicyFn<ContextType, Args>
}

export namespace Policy {
  export function create<ContextType extends PolicyContext<unknown>, Args extends any[]>(
    execute: PolicyFn<ContextType, Args>
  ): Policy<ContextType, Args> {
    return {
      execute
    }
  }
}
