import { PolicyContext } from './policy-context'
import { Policy } from './policy'
import { NotAuthorizedException } from './exceptions'

type UserType<T extends PolicyContext<unknown>> = PolicyContext.UserType<T>

export interface AuthorizerOptions<ContextType extends PolicyContext<unknown>> {
  /**
   * Policies to execute before executing the policy that we wish to authorize
   */
  before?: Array<Policy<ContextType, []>>
}

export class Authorizer<ContextType extends PolicyContext<unknown>> {
  constructor(private readonly _context: ContextType, private readonly _options: AuthorizerOptions<ContextType> = {}) {}

  public getCurrentUser(): UserType<ContextType>
  public getCurrentUser(options: { allowGuest: false }): UserType<ContextType>
  public getCurrentUser(options: { allowGuest: true }): UserType<ContextType> | null
  public getCurrentUser(options?: any) {
    return this._context.getCurrentUser(options)
  }

  public async authorize<Args extends any[]>(policy: Policy<ContextType, Args>, ...args: Args): Promise<void> {
    const beforePolicies = this._options.before ?? []
    for (const beforePolicy of beforePolicies) {
      const res = await beforePolicy.execute(this._context)
      if (res === false) {
        throw new NotAuthorizedException()
      }
      if (res === true) {
        return
      }
    }

    const res = await policy.execute(this._context, ...args)
    if (res === false) {
      throw new NotAuthorizedException()
    }
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
