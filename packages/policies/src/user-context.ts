import { AsyncLocalStorage } from 'async_hooks'
import { NoUserContextException } from './exceptions'

export class UserContext<User> {
  private readonly _als = new AsyncLocalStorage<{ user: User | null }>()

  /**
   * Create a new user context for the given asynchroneous scope.
   *
   * Once a context has been created, you will be able to set data in your user context inside the asynchroneous scope.
   *
   * @see `UserContext#setUser`
   */
  public createContext<T>(fn: () => T) {
    const user = null
    return this._als.run({ user }, fn)
  }

  /**
   * Set the current user in the current user context.
   * If no user context is initialized, this function will throw an `NoUserContextException`.
   *
   * @example
   * ```
   * userContext.createContext(async () => {
   *  // Set user in current context
   *  userContext.setUser(myUser)
   *
   *  // Get user in current context
   *  userContext.getCurrentUser()
   * })
   *
   * // This will throw an `NoUserContextException` exception:
   * userContext.setUser(myUser)
   * ```
   */
  public setUser(user: User | null) {
    const store = this._als.getStore() ?? null
    if (!store) {
      throw new NoUserContextException()
    }
    store.user = user
  }

  /**
   * Create a new user context for the given asynchroneous scope.
   *
   * This is the same as:
   *
   * ```ts
   * userContext.createContext(() => {
   *   userContext.setUser(user)
   *   return fn()
   * })
   * ```
   */
  public forUser<T>(user: User | null, fn: () => T) {
    return this._als.run({ user }, fn)
  }

  public getUser() {
    return this._als.getStore()?.user ?? null
  }
}
