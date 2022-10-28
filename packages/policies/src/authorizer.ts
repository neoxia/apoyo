import { PolicyContext } from './policy-context'
import { Policy } from './policy'

type UserType<T extends PolicyContext<unknown>> = PolicyContext.UserType<T>

export interface AuthorizerOptions<User> {
  /**
   * Interceptor to execute when authorizing a policy.
   *
   * @param user - The current user
   * @param action - The name of the executed policy
   * @param authorize - The function to execute the policy
   *
   * @example
   * ```ts
   * const authorizer = new Authorizer(myPolicyContext, {
   *   async interceptor(user, action, authorize) {
   *     try {
   *       await authorize()
   *       console.log(`${action} was authorized for ${user?.email ?? 'Guest' }`)
   *     } catch (err) {
   *       console.log(`${action} denied for ${user?.email ?? 'Guest' }`, err)
   *       throw err
   *     }
   *   }
   * })
   * ```
   */
  interceptor?(user: User | null, action: string, authorize: () => Promise<void>): Promise<void>
}

export class Authorizer<ContextType extends PolicyContext<unknown>> {
  constructor(
    private readonly _context: ContextType,
    private readonly _options: AuthorizerOptions<UserType<ContextType>> = {}
  ) {}

  public getCurrentUser(): UserType<ContextType>
  public getCurrentUser(options: { allowGuest: false }): UserType<ContextType>
  public getCurrentUser(options: { allowGuest: true }): UserType<ContextType> | null
  public getCurrentUser(options?: any) {
    return this._context.getCurrentUser(options)
  }

  public async authorize<Args extends any[]>(policy: Policy<ContextType, Args>, ...args: Args): Promise<void> {
    if (this._options.interceptor) {
      await this._options.interceptor(this.getCurrentUser({ allowGuest: true }), policy.name, () =>
        policy.authorize(this._context, ...args)
      )
      return
    }
    await policy.authorize(this._context, ...args)
  }

  public async allows<Args extends any[]>(policy: Policy<ContextType, Args>, ...args: Args): Promise<boolean> {
    return this.authorize(policy, ...args)
      .then(() => true)
      .catch(() => false)
  }

  public async denies<Args extends any[]>(policy: Policy<ContextType, Args>, ...args: Args): Promise<boolean> {
    return this.allows(policy, ...args).then((allowed) => !allowed)
  }
}
