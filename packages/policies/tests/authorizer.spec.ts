import { Authorizer, NotAuthenticatedException, NotAuthorizedException, UserContext } from '../src'
import { CommonPolicyContext, AclRepository } from './setup/context'
import { EditPostPolicy } from './setup/policies'
import { Post, User } from './setup/types'

const lazy = (_fn: () => any) => {
  return
}

describe('Authorizer', () => {
  let userContext: UserContext<User>
  let policyContext: CommonPolicyContext
  let authorizer: Authorizer<CommonPolicyContext>

  beforeEach(() => {
    userContext = new UserContext<User>()

    const aclRepository = new AclRepository()
    policyContext = new CommonPolicyContext(userContext, aclRepository)
    authorizer = new Authorizer(policyContext)
  })

  describe('authorize', () => {
    it('should throw typescript error on invalid authorizer policy context', async () => {
      class AnotherPolicyContext {
        getCurrentUser(): User
        getCurrentUser(options: { allowGuest: false }): User
        getCurrentUser(options: { allowGuest: true }): User | null
        getCurrentUser(options: { allowGuest: boolean } = { allowGuest: false }): User | null {
          if (!options.allowGuest) {
            throw new NotAuthenticatedException()
          }
          return null
        }
      }

      const policyContext = new AnotherPolicyContext()
      const authorizer = new Authorizer(policyContext)

      const post1: Post = {
        id: 'post_id_1',
        authorId: 'user_id_1',
        status: 'draft'
      }

      // @ts-expect-error Invalid context
      lazy(() => authorizer.authorize(EditPostPolicy, post1))
    })

    it('should authorize user for a given policy', async () => {
      const member: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }
      const admin: User = {
        id: 'user_id_2',
        email: 'test_2@example.com',
        role: 'admin'
      }

      const viewSecretStorePolicy = {
        name: 'viewSecretStorePolicy',
        authorize: async function* (ctx: CommonPolicyContext) {
          return ctx.getCurrentUser()?.role === 'admin'
        }
      }

      await userContext.createContext(async () => {
        userContext.setUser(admin)

        await expect(authorizer.authorize(viewSecretStorePolicy)).resolves.toBe(undefined)

        userContext.setUser(member)

        await expect(authorizer.authorize(viewSecretStorePolicy)).rejects.toThrowError(NotAuthorizedException)
      })
    })

    it('should yield early when middleware yields', async () => {
      const user1: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }
      const user2: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      const post: Post = {
        id: 'post_id_1',
        authorId: 'user_id_2',
        status: 'draft'
      }

      await userContext.createContext(async () => {
        userContext.setUser(user1)

        await expect(authorizer.authorize(EditPostPolicy, post)).resolves.toBe(undefined)

        userContext.setUser(user2)

        await expect(authorizer.authorize(EditPostPolicy, post)).rejects.toThrowError(NotAuthorizedException)
      })
    })
  })

  describe('allows', () => {
    it('should check if user is allowed to continue given policy', async () => {
      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      await userContext.forUser(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          authorId: 'user_id_1',
          status: 'draft'
        }

        expect(await authorizer.allows(EditPostPolicy, post1)).toBe(true)

        const post2: Post = {
          id: 'post_id_2',
          authorId: 'user_id_2',
          status: 'draft'
        }

        expect(await authorizer.allows(EditPostPolicy, post2)).toBe(false)
      })
    })
  })

  describe('denies', () => {
    it('should check if user is not allowed to continue given policy', async () => {
      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      await userContext.forUser(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          authorId: 'user_id_1',
          status: 'draft'
        }

        expect(await authorizer.denies(EditPostPolicy, post1)).toBe(false)

        const post2: Post = {
          id: 'post_id_2',
          authorId: 'user_id_2',
          status: 'draft'
        }

        expect(await authorizer.denies(EditPostPolicy, post2)).toBe(true)
      })
    })
  })

  describe('new', () => {
    it('should execute interceptor correctly', async () => {
      const onError = jest.fn()
      const onSuccess = jest.fn()

      const authorizer = new Authorizer(policyContext, {
        async interceptor(ctx, policy, authorize) {
          const user = ctx.getCurrentUser({ allowGuest: true })
          const username = user?.email ?? 'Guest'
          const action = policy.name ?? 'UnknownPolicy'
          try {
            await authorize()
            onSuccess({
              message: `${action} was authorized for ${username}`,
              action,
              username
            })
          } catch (err) {
            onError({
              message: `${action} denied for ${username}`,
              action,
              username,
              cause: err
            })
            throw err
          }
        }
      })

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      await userContext.forUser(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          authorId: 'user_id_1',
          status: 'draft'
        }

        expect(await authorizer.allows(EditPostPolicy, post1)).toBe(true)
        expect(onError).not.toHaveBeenCalled()
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'EditPostPolicy',
            username: 'test@example.com'
          })
        )

        onSuccess.mockReset()
        onError.mockReset()

        const post2: Post = {
          id: 'post_id_2',
          authorId: 'user_id_2',
          status: 'draft'
        }

        expect(await authorizer.allows(EditPostPolicy, post2)).toBe(false)
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'EditPostPolicy',
            username: 'test@example.com',
            cause: expect.any(NotAuthorizedException)
          })
        )
      })
    })
  })
})
