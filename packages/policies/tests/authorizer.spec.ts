import { pipe } from '@apoyo/std'
import { Authorizer, NotAuthorizedException, Policy, UserContext } from '../src'
import { CommonPolicyContext, PostPolicyContext, AccessRepository } from './setup/context'
import { PostPolicy } from './setup/policies/post.policy'
import { Post, User } from './setup/types'

const lazy = (_fn: () => any) => {
  return
}

describe('Authorizer', () => {
  describe('getCurrentUser', () => {
    it('should be able to get current user', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new CommonPolicyContext(userContext)
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }

      await userContext.forUser(user, async () => {
        expect(authorizer.getCurrentUser()).toEqual(user)
      })
    })
  })

  describe('authorize', () => {
    it('should throw typescript error on invalid authorizer policy context', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new CommonPolicyContext(userContext)
      const authorizer = new Authorizer(policyContext)

      const post1: Post = {
        id: 'post_id_1',
        userId: 'user_id_1',
        status: 'draft'
      }

      // @ts-expect-error Invalid context
      lazy(() => authorizer.authorize(PostPolicy.editPost, post1))
    })

    it('should authorize user for a given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new PostPolicyContext(userContext, new AccessRepository())
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      const customPolicy = pipe(
        Policy.base(),
        Policy.define('custom', (ctx: CommonPolicyContext, post: Post) => {
          return ctx.getCurrentUser().id === post.userId
        })
      )

      await userContext.forUser(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          userId: user.id,
          status: 'draft'
        }

        await expect(authorizer.authorize(customPolicy, post1)).resolves.toBe(undefined)

        const post2: Post = {
          id: 'post_id_2',
          userId: 'user_id_2',
          status: 'draft'
        }

        await expect(authorizer.authorize(customPolicy, post2)).rejects.toThrowError(NotAuthorizedException)
      })
    })

    it('should execute before policies before given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new PostPolicyContext(userContext, new AccessRepository())
      const authorizer = new Authorizer(policyContext)

      const user1: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }

      await userContext.forUser(user1, async () => {
        const post: Post = {
          id: 'post_id_1',
          userId: 'user_id_2',
          status: 'draft'
        }

        await expect(authorizer.authorize(PostPolicy.editPost, post)).resolves.toBe(undefined)
      })

      const user2: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      await userContext.forUser(user2, async () => {
        const post: Post = {
          id: 'post_id_1',
          userId: 'user_id_2',
          status: 'draft'
        }

        await expect(authorizer.authorize(PostPolicy.editPost, post)).rejects.toThrowError(NotAuthorizedException)
      })
    })
  })

  describe('allows', () => {
    it('should check if user is allowed to continue given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new PostPolicyContext(userContext, new AccessRepository())
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      await userContext.forUser(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          userId: 'user_id_1',
          status: 'draft'
        }

        expect(await authorizer.allows(PostPolicy.editPost, post1)).toBe(true)

        const post2: Post = {
          id: 'post_id_2',
          userId: 'user_id_2',
          status: 'draft'
        }

        expect(await authorizer.allows(PostPolicy.editPost, post2)).toBe(false)
      })
    })
  })

  describe('denies', () => {
    it('should check if user is not allowed to continue given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new PostPolicyContext(userContext, new AccessRepository())
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      await userContext.forUser(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          userId: 'user_id_1',
          status: 'draft'
        }

        expect(await authorizer.denies(PostPolicy.editPost, post1)).toBe(false)

        const post2: Post = {
          id: 'post_id_2',
          userId: 'user_id_2',
          status: 'draft'
        }

        expect(await authorizer.denies(PostPolicy.editPost, post2)).toBe(true)
      })
    })
  })

  describe('new', () => {
    it('should execute interceptor correctly', async () => {
      const onError = jest.fn()
      const onSuccess = jest.fn()

      const userContext = new UserContext<User>()
      const policyContext = new PostPolicyContext(userContext, new AccessRepository())
      const authorizer = new Authorizer(policyContext, {
        async interceptor(user, action, authorize) {
          const username = user?.email ?? 'Guest'
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
          userId: 'user_id_1',
          status: 'draft'
        }

        expect(await authorizer.allows(PostPolicy.editPost, post1)).toBe(true)
        expect(onError).not.toHaveBeenCalled()
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'PostPolicy.editPost',
            username: 'test@example.com'
          })
        )

        onSuccess.mockReset()
        onError.mockReset()

        const post2: Post = {
          id: 'post_id_2',
          userId: 'user_id_2',
          status: 'draft'
        }

        expect(await authorizer.allows(PostPolicy.editPost, post2)).toBe(false)
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'PostPolicy.editPost',
            username: 'test@example.com',
            cause: expect.any(NotAuthorizedException)
          })
        )
      })
    })
  })
})
