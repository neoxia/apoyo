import { PolicyContext } from './policy-context'
import { Policy } from './policy'

type UserType<T extends PolicyContext<unknown>> = PolicyContext.UserType<T>

export class Authorizer<ContextType extends PolicyContext<unknown>> {
  constructor(private readonly _context: ContextType) {}

  public getCurrentUser(): UserType<ContextType>
  public getCurrentUser(options: { allowGuest: false }): UserType<ContextType>
  public getCurrentUser(options: { allowGuest: true }): UserType<ContextType> | null
  public getCurrentUser(options?: any) {
    return this._context.getCurrentUser(options)
  }

  public async authorize<Args extends any[]>(policy: Policy<ContextType, Args>, ...args: Args): Promise<void> {
    // TODO: handle before middlewares
    await policy.execute(this._context, ...args)
    // TODO: handle after middlewares
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
