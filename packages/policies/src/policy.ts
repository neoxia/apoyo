import { NotAuthorizedException } from './exceptions'
import { PolicyContext } from './policy-context'

type AnyArgsOf<Args extends any[]> = Args | (Args extends [...infer Items, any] ? AnyArgsOf<Items> : [])

export type PolicyMiddleware<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> = (
  ctx: ContextType,
  ...args: Args
) => boolean | void | Promise<boolean | void>

export type PolicyHandler<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> = (
  ctx: ContextType,
  ...args: Args
) => boolean | Promise<boolean>

export interface Policy<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> {
  name: string
  authorize: (ctx: ContextType, ...args: Args) => Promise<void>
}

export interface PolicyBase<ContextType extends PolicyContext<unknown>, Args extends any[] = any[]> {
  namespace?: string
  authorize?: PolicyMiddleware<ContextType, Args>
}

export namespace Policy {
  export const base = <ContextType extends PolicyContext<unknown>>(): PolicyBase<ContextType, []> => {
    return {}
  }

  /**
   * Prefix all policies using this base with the given namespace
   */
  export const namespace = <ContextType extends PolicyContext<unknown>>(namespace: string) => (
    policy: PolicyBase<ContextType>
  ): PolicyBase<ContextType> => {
    return {
      namespace: policy.namespace ? `${policy.namespace}.${namespace}` : namespace,
      authorize: policy.authorize
    }
  }

  /**
   * Middleware to use before executing the given policy:
   * - Succeed authorization attempt if "true" is returned. The next middleware or policy is not executed.
   * - Fails authorization attempts if "false" is returned. An NotAuthorizationException is thrown in this case.
   * - Fails authorization attempts if an exception is thrown.
   * - Continues to the next middleware / policy if "undefined" is returned.
   */
  export function use<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    middleware: PolicyMiddleware<T2, AnyArgsOf<Args>>
  ): (base: PolicyBase<T1, Args>) => PolicyBase<T2, Args>
  export function use<
    T1 extends PolicyContext<unknown>,
    T2 extends T1,
    Args1 extends any[],
    Args2 extends [...Args1, ...any[]]
  >(middleware: PolicyMiddleware<T2, Args2>): (base: PolicyBase<T1, Args1>) => PolicyBase<T2, Args2>
  export function use<T1 extends PolicyContext<unknown>, T2 extends T1>(
    middleware: PolicyMiddleware<T2, any[]>
  ): (base: PolicyBase<T1, any[]>) => PolicyBase<T2, any[]> {
    return (base) => {
      const authorize = base.authorize
      return {
        namespace: base.namespace,
        authorize: authorize
          ? async (ctx, ...args) => {
              const result = await authorize(ctx, ...args)
              if (result === false || result === true) {
                return result
              }
              return middleware(ctx, ...args)
            }
          : middleware
      }
    }
  }

  /**
   * Define a new policy
   * - Succeed authorization attempt if "true" is returned.
   * - Fails authorization attempts if "false" is returned. An NotAuthorizationException is thrown in this case.
   * - Fails authorization attempts if an exception is thrown.
   */
  export function define<T1 extends PolicyContext<unknown>, T2 extends T1, Args extends any[]>(
    name: string,
    authorize: PolicyHandler<T2, Args>
  ): (base: PolicyBase<T1, Args>) => Policy<T2, Args> {
    return (base) => {
      const middleware = base.authorize
      return {
        name: base.namespace ? `${base.namespace}.${name}` : name,
        authorize: async (ctx, ...args) => {
          if (middleware) {
            const middlewareResult = await middleware(ctx, ...args)
            if (middlewareResult === false) {
              throw new NotAuthorizedException()
            }
            if (middlewareResult === true) {
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
