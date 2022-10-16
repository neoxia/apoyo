import { UserContext } from './user-context'

export class PolicyContext<User> {
  constructor(private readonly _userContext: UserContext<User>) {}

  public getCurrentUser(): User
  public getCurrentUser(options: { allowGuest: false }): User
  public getCurrentUser(options: { allowGuest: true }): User | null
  public getCurrentUser(options?: any) {
    return this._userContext.getCurrentUser(options)
  }
}

export namespace PolicyContext {
  export type UserType<T extends PolicyContext<unknown>> = T extends PolicyContext<infer A> ? A : never
}
