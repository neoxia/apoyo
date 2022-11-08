import { Prom } from '@apoyo/std'
import { NotAuthenticatedException, NoUserContextException, UserContext } from '../src'
import { User } from './setup/types'

describe('UserContext', () => {
  it('should create new user context', async () => {
    const userContext = new UserContext<User>()

    const user: User = {
      id: 'user_id_1',
      email: 'test@example.com',
      role: 'admin'
    }

    await userContext.createContext(async () => {
      userContext.setUser(user)

      expect(userContext.getCurrentUser()).toEqual(user)
    })
  })

  it('should be able to set user in user context correctly', async () => {
    const userContext = new UserContext<User>()

    const user: User = {
      id: 'user_id_1',
      email: 'test@example.com',
      role: 'admin'
    }

    async function auth() {
      // Fetching our user takes some time...
      await Prom.sleep(10)
      // Set user
      userContext.setUser(user)
    }

    await userContext.createContext(async () => {
      await auth()

      expect(userContext.getCurrentUser()).toEqual(user)
    })
  })

  it('should throw when trying to set user outside of user context', async () => {
    const userContext = new UserContext<User>()

    const user: User = {
      id: 'user_id_1',
      email: 'test@example.com',
      role: 'admin'
    }

    async function auth() {
      // Fetching our user takes some time...
      await Prom.sleep(10)
      // Set user
      userContext.setUser(user)
    }

    expect(auth()).rejects.toThrow(NoUserContextException)
  })

  it('should be able to create sub-context', async () => {
    const userContext = new UserContext<User>()

    const user1: User = {
      id: 'user_id_1',
      email: 'test@example.com',
      role: 'admin'
    }
    const user2: User = {
      id: 'user_id_2',
      email: 'test@example.com',
      role: 'admin'
    }

    await userContext.createContext(async () => {
      userContext.setUser(user1)

      await userContext.createContext(async () => {
        userContext.setUser(user2)

        expect(userContext.getCurrentUser()).toEqual(user2)
      })

      await userContext.forUser(user2, async () => {
        expect(userContext.getCurrentUser()).toEqual(user2)
      })

      expect(userContext.getCurrentUser()).toEqual(user1)
    })
  })

  it('should store current user in async context', async () => {
    const userContext = new UserContext<User>()

    const user: User = {
      id: 'user_id_1',
      email: 'test@example.com',
      role: 'admin'
    }

    await userContext.forUser(user, async () => {
      expect(userContext.getCurrentUser()).toEqual(user)
    })
  })

  it('should throw when outside of context', async () => {
    const userContext = new UserContext<User>()

    expect(() => userContext.getCurrentUser()).toThrowError(NotAuthenticatedException)
  })

  it('should throw when no user is stored in context', async () => {
    const userContext = new UserContext<User>()

    await userContext.forUser(null, async () => {
      expect(() => userContext.getCurrentUser()).toThrowError(NotAuthenticatedException)
    })
  })

  it('should not throw when allowing guests', async () => {
    const userContext = new UserContext<User>()

    await userContext.forUser(null, async () => {
      expect(userContext.getCurrentUser({ allowGuest: true })).toEqual(null)
    })
  })
})
