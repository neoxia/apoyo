import { Policy, PolicyType } from './policy'
import { NotAuthorizedException } from './exceptions'
export interface AuthorizerOptions<PolicyContext> {
  /**
   * Interceptor to execute when authorizing a policy.
   *
   * @param ctx - The current policy context
   * @param policy - The name of the executed policy
   * @param authorize - The function to execute the policy
   *
   * @example
   * ```ts
   * const authorizer = new Authorizer(myPolicyContext, {
   *   async interceptor(ctx, action, authorize) {
   *     const user = ctx.getCurrentUser({ allowGuest: true });
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
  interceptor?(user: PolicyContext, policy: Policy<PolicyContext>, authorize: () => Promise<void>): Promise<void>
}

export class Authorizer<PolicyContext> {
  constructor(
    private readonly _context: PolicyContext,
    private readonly _options: AuthorizerOptions<PolicyContext> = {}
  ) {}

  public async authorize<Args extends any[]>(policy: PolicyType<PolicyContext, Args>, ...args: Args): Promise<void> {
    // Improve debugging by adding the class name to the policy class prototype as a readonly property, to make it accessible using policy.name
    if (typeof policy === 'function' && !policy.prototype.name) {
      Object.defineProperty(policy.prototype, 'name', {
        value: policy.name,
        writable: false
      })
    }
    const policyInstance = typeof policy === 'function' ? new policy() : policy

    const run = async () => {
      const it = policyInstance.authorize(this._context, ...args)
      const result = await it.next()
      if (result.value === false) {
        throw new NotAuthorizedException()
      }
    }

    if (this._options.interceptor) {
      return await this._options.interceptor(this._context, policyInstance as Policy<PolicyContext>, run)
    }
    return await run()
  }

  public async allows<Args extends any[]>(policy: PolicyType<PolicyContext, Args>, ...args: Args): Promise<boolean> {
    return this.authorize(policy, ...args)
      .then(() => true)
      .catch(() => false)
  }

  public async denies<Args extends any[]>(policy: PolicyType<PolicyContext, Args>, ...args: Args): Promise<boolean> {
    return this.allows(policy, ...args).then((allowed) => !allowed)
  }
}
