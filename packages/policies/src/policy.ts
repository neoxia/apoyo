import { NotAuthorizedException } from './exceptions'
import { PolicyContext } from './policy-context'

export type BeforePolicyFn<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> = (
  ctx: ContextType,
  ...args: Args
) => boolean | void | Promise<boolean | void>

export type PolicyFn<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> = (
  ctx: ContextType,
  ...args: Args
) => boolean | Promise<boolean>

export interface BeforePolicy<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> {
  namespace?: string
  authorize?: BeforePolicyFn<ContextType, Args>
}

export interface Policy<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> {
  name: string
  authorize: (ctx: ContextType, ...args: Args) => Promise<void>
}

export namespace Policy {
  export const base = <ContextType extends PolicyContext<unknown>>(): BeforePolicy<ContextType, []> => {
    return {}
  }

  export const namespace = <ContextType extends PolicyContext<unknown>>(namespace: string) => (
    policy: BeforePolicy<ContextType>
  ): BeforePolicy<ContextType> => {
    return {
      namespace: policy.namespace ? `${policy.namespace}.${namespace}` : namespace,
      authorize: policy.authorize
    }
  }

  export function before<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    before: BeforePolicyFn<T2, []>
  ): (policy: BeforePolicy<T1, Args>) => BeforePolicy<T2, Args>
  export function before<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    before: BeforePolicyFn<T2, [Args[0]]>
  ): (policy: BeforePolicy<T1, Args>) => BeforePolicy<T2, Args>
  export function before<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    before: BeforePolicyFn<T2, [Args[0], Args[1]]>
  ): (policy: BeforePolicy<T1, Args>) => BeforePolicy<T2, Args>
  export function before<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    before: BeforePolicyFn<T2, [Args[0], Args[1], Args[2]]>
  ): (policy: BeforePolicy<T1, Args>) => BeforePolicy<T2, Args>
  export function before<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    before: BeforePolicyFn<T2, [Args[0], Args[1], Args[2], Args[3]]>
  ): (policy: BeforePolicy<T1, Args>) => BeforePolicy<T2, Args>
  export function before<
    T1 extends PolicyContext<unknown>,
    T2 extends T1,
    Args1 extends any[],
    Args2 extends [...Args1, ...any[]]
  >(before: BeforePolicyFn<T2, Args2>): (policy: BeforePolicy<T1, Args1>) => BeforePolicy<T2, Args2>
  export function before<T1 extends PolicyContext<unknown>, T2 extends T1>(
    before: BeforePolicyFn<T2, any[]>
  ): (policy: BeforePolicy<T1, any[]>) => BeforePolicy<T2, any[]> {
    return (policy) => {
      const authorize = policy.authorize
      return {
        namespace: policy.namespace,
        authorize: authorize
          ? async (ctx, ...args) => {
              const res = await authorize(ctx, ...args)
              if (res === false) {
                throw new NotAuthorizedException()
              }
              if (res === true) {
                return true
              }
              return before(ctx, ...args)
            }
          : before
      }
    }
  }

  export function define<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    name: string,
    authorize: PolicyFn<T2, Args>
  ): (policy: BeforePolicy<T1, Args>) => Policy<T2, Args> {
    return (policy) => {
      const before = policy.authorize
      return {
        name: policy.namespace ? `${policy.namespace}.${name}` : name,
        authorize: async (ctx, ...args) => {
          if (before) {
            const beforeResult = await before(ctx, ...args)
            if (beforeResult === false) {
              throw new NotAuthorizedException()
            }
            if (beforeResult === true) {
              return
            }
          }
          const result = await authorize(ctx, ...args)
          if (result === false) {
            throw new NotAuthorizedException()
          }
        }
      }
    }
  }
}
