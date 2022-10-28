import { AsyncLocalStorage } from 'async_hooks'
import { NotAuthenticatedException } from './exceptions'

export class UserContext<User> {
  private readonly _als = new AsyncLocalStorage<User | null>()

  public forUser<T>(user: User | null, fn: () => T) {
    return this._als.run(user, fn)
  }

  public getCurrentUser(): User
  public getCurrentUser(options: { allowGuest: false }): User
  public getCurrentUser(options: { allowGuest: true }): User | null
  public getCurrentUser(options?: { allowGuest: boolean }): User | null {
    const allowGuest = options?.allowGuest ?? false
    const user = this._als.getStore() ?? null
    if (!allowGuest && !user) {
      throw new NotAuthenticatedException()
    }
    return user
  }
}
