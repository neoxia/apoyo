import { NotAuthenticatedException, UserContext } from '../src'
import { User } from './setup/types'

describe('UserContext', () => {
  it('should store current user in async context', async () => {
    const userContext = new UserContext<User>()

    const user: User = {
      id: 'user_id_1',
      email: 'test@example.com',
      role: 'admin'
    }

    await userContext.runAsync(user, async () => {
      expect(userContext.getCurrentUser()).toEqual(user)
    })
  })

  it('should throw when outside of context', async () => {
    const userContext = new UserContext<User>()

    expect(() => userContext.getCurrentUser()).toThrowError(NotAuthenticatedException)
  })

  it('should throw when no user is stored in context', async () => {
    const userContext = new UserContext<User>()

    await userContext.runAsync(null, async () => {
      expect(() => userContext.getCurrentUser()).toThrowError(NotAuthenticatedException)
    })
  })

  it('should not throw when allowing guests', async () => {
    const userContext = new UserContext<User>()

    await userContext.runAsync(null, async () => {
      expect(userContext.getCurrentUser({ allowGuest: true })).toEqual(null)
    })
  })
})
