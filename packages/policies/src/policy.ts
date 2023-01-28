/**
 * Interface to implement when using class based policies
 */
export interface BasePolicy {
  name?: string
  authorize(ctx: unknown, ...args: any[]): AsyncGenerator<boolean, boolean, void>
}

export interface Policy<ContextType, Args extends any[] = any[]> {
  name?: string
  authorize: (ctx: ContextType, ...args: Args) => AsyncGenerator<boolean, boolean, void>
}

export interface PolicyConstructor<ContextType, Args extends any[] = any[]> {
  new (): Policy<ContextType, Args>
}

export type PolicyType<ContextType, Args extends any[] = any[]> =
  | Policy<ContextType, Args>
  | PolicyConstructor<ContextType, Args>
