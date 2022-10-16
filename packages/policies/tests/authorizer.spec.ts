import { Authorizer, NotAuthorizedException, UserContext } from '../src'
import { AclRepository, AppPolicyContext } from './setup/context'
import { GlobalPolicy } from './setup/policies/global.policy'
import { PostPolicy } from './setup/policies/post.policy'
import { Post, User } from './setup/types'

describe('Authorizer', () => {
  describe('getCurrentUser', () => {
    it('should be able to get current user', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new AppPolicyContext(userContext, new AclRepository())
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }

      await userContext.runAsync(user, async () => {
        expect(authorizer.getCurrentUser()).toEqual(user)
      })
    })
  })

  describe('authorize', () => {
    it('should authorize user for a given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new AppPolicyContext(userContext, new AclRepository())
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }

      await userContext.runAsync(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          userId: user.id
        }

        await expect(authorizer.authorize(PostPolicy.editPost, post1)).resolves.toBe(undefined)

        const post2: Post = {
          id: 'post_id_2',
          userId: 'user_id_2'
        }

        await expect(authorizer.authorize(PostPolicy.editPost, post2)).rejects.toThrowError(NotAuthorizedException)
      })
    })

    it('should execute before policies before given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new AppPolicyContext(userContext, new AclRepository())

      const authorizer = new Authorizer(policyContext, {
        before: [GlobalPolicy.isAdmin]
      })

      const user1: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }

      await userContext.runAsync(user1, async () => {
        const post: Post = {
          id: 'post_id_1',
          userId: 'user_id_2'
        }

        await expect(authorizer.authorize(PostPolicy.editPost, post)).resolves.toBe(undefined)
      })

      const user2: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'member'
      }

      await userContext.runAsync(user2, async () => {
        const post: Post = {
          id: 'post_id_1',
          userId: 'user_id_2'
        }

        await expect(authorizer.authorize(PostPolicy.editPost, post)).rejects.toThrowError(NotAuthorizedException)
      })
    })
  })

  describe('allows', () => {
    it('should check if user is allowed to continue given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new AppPolicyContext(userContext, new AclRepository())
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }

      await userContext.runAsync(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          userId: user.id
        }

        expect(await authorizer.allows(PostPolicy.editPost, post1)).toBe(true)

        const post2: Post = {
          id: 'post_id_2',
          userId: 'user_id_2'
        }

        expect(await authorizer.allows(PostPolicy.editPost, post2)).toBe(false)
      })
    })
  })

  describe('denies', () => {
    it('should check if user is not allowed to continue given policy', async () => {
      const userContext = new UserContext<User>()
      const policyContext = new AppPolicyContext(userContext, new AclRepository())
      const authorizer = new Authorizer(policyContext)

      const user: User = {
        id: 'user_id_1',
        email: 'test@example.com',
        role: 'admin'
      }

      await userContext.runAsync(user, async () => {
        const post1: Post = {
          id: 'post_id_1',
          userId: user.id
        }

        expect(await authorizer.denies(PostPolicy.editPost, post1)).toBe(false)

        const post2: Post = {
          id: 'post_id_2',
          userId: 'user_id_2'
        }

        expect(await authorizer.denies(PostPolicy.editPost, post2)).toBe(true)
      })
    })
  })
})
